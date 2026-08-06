import { useEffect, useRef, useState } from "react";
import { Camera, Save, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

// ─── helpers ────────────────────────────────────────────────────────────────
function Avatar({ user, onUpload, uploading }) {
    const inputRef = useRef(null);

    const avatarSrc = user?.profilePicture
        ? user.profilePicture
        : `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
              user?.firstName + " " + user?.lastName
          )}`;

    return (
        <div className="relative h-20 w-20 shrink-0">
            <img
                src={avatarSrc}
                alt={user?.firstName}
                className="h-full w-full rounded-full object-cover ring-4 ring-[#ede9fe]"
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 cursor-pointer right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-md transition hover:bg-[#6d28d9] disabled:opacity-60"
                title="Change photo"
            >
                {uploading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                    <Camera size={17} strokeWidth={2.5} />
                )}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onUpload}
            />
        </div>
    );
}

function SectionCard({ title, description, children }) {
    return (
        <div className="rounded-2xl border border-[#ecebf3] bg-white shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]" data-aos="fade-up">
            <div className="border-b border-[#ecebf3] px-6 py-5">
                <h2 className="text-base font-bold text-[#0f0b1f]">{title}</h2>
                {description && (
                    <p className="mt-0.5 text-sm text-[#6b6680]">{description}</p>
                )}
            </div>
            <div className="px-6 py-6">{children}</div>
        </div>
    );
}

function Field({ label, id, type = "text", value, onChange, placeholder, disabled, error }) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-[#a8a3bd]">
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`mt-1.5 w-full rounded-xl border bg-[#f9f8fc] px-4 py-2.5 text-sm text-[#0f0b1f] outline-none transition placeholder:text-[#c4bfd8] focus:ring-2 disabled:opacity-50 ${
                    error
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-[#ecebf3] focus:border-[#7c3aed] focus:ring-[#ede9fe]"
                }`}
            />
            {error && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                    <span>⚠</span> {error}
                </p>
            )}
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Account() {
    const { user, token, login } = useAuth();

    // ── profile form state ──
    const [profile, setProfile] = useState({
        firstName: user?.firstName ?? "",
        lastName:  user?.lastName  ?? "",
        username:  user?.username  ?? "",
        email:     user?.email     ?? "",
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingPic,  setUploadingPic]  = useState(false);
    const [usernameError, setUsernameError] = useState("");

    // Sync form when user loads from localStorage (fixes empty fields on refresh)
    useEffect(() => {
        if (user) {
            setProfile({
                firstName: user.firstName ?? "",
                lastName:  user.lastName  ?? "",
                username:  user.username  ?? "",
                email:     user.email     ?? "",
            });
        }
    }, [user]);
    const [passwords, setPasswords] = useState({
        current: "",
        next:    "",
        confirm: "",
    });
    const [savingPass, setSavingPass] = useState(false);

    // ── profile picture upload ──────────────────────────────────────────────
    const handlePictureChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profilePicture", file);

        setUploadingPic(true);
        api
            .patch(`/auth/users/${user._id}/profile-picture`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
                if (res.data.success) {
                    login(res.data.user, token);
                    toast.success("Profile picture updated!");
                }
            })
            .catch((err) => {toast.error(err.response?.data?.message || "Failed to update profile picture.");
            console.log(err?.response?.data?.message)
            }
        )
            .finally(() => setUploadingPic(false));
    };

    // ── profile text fields save ────────────────────────────────────────────
    const handleProfileSave = (e) => {
        e.preventDefault();
        if (!profile.firstName.trim() || !profile.lastName.trim() || !profile.email.trim()) {
            toast.error("First name, last name and email are required.");
            return;
        }

        setSavingProfile(true);
        setUsernameError("");
        api
            .patch(`/auth/users/${user._id}`, profile)
            .then((res) => {
                if (res.data.success) {
                    login(res.data.user, token);
                    toast.success("Profile updated!");
                }
            })
            .catch((err) => {
                const data = err.response?.data;
                // Inline error for duplicate username
                if (err.response?.status === 409 && data?.field === "username") {
                    setUsernameError(data.message);
                } else {
                    toast.error(data?.message ?? "Failed to update profile.");
                }
            })
            .finally(() => setSavingProfile(false));
    };

    // ── password change (stub — wire when endpoint is ready) ───────────────
    const handlePasswordSave = (e) => {
        e.preventDefault();
        if (passwords.next !== passwords.confirm) {
            toast.error("New passwords do not match.");
            return;
        }
        if (passwords.next.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }
        setSavingPass(true);
        // TODO: wire to PATCH /users/:id/password when endpoint exists
        setTimeout(() => {
            toast.success("Password updated! (stub)");
            setPasswords({ current: "", next: "", confirm: "" });
            setSavingPass(false);
        }, 800);
    };

    const profileField = (key) => ({
        value: profile[key],
        onChange: (e) => {
            if (key === "username") setUsernameError(""); // clear error on type
            setProfile((p) => ({ ...p, [key]: e.target.value }));
        },
    });

    return (
        <div className="flex flex-col gap-6">

            {/* ── Profile ──────────────────────────────────────────────── */}
            <SectionCard
                title="Profile"
                description="Update your name, username, and email address."
            >
                {/* Avatar row */}
                <div className="mb-6 flex items-center gap-5">
                    <Avatar
                        user={user}
                        onUpload={handlePictureChange}
                        uploading={uploadingPic}
                    />
                    <div>
                        <p className="text-base font-bold text-[#0f0b1f]">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-[#6b6680]">{user?.email}</p>
                        <span className="mt-1 inline-block rounded-full bg-[#f5f3ff] px-2.5 py-0.5 text-xs font-semibold text-[#7c3aed]">
                            {user?.role === "admin" ? "Admin" : "Free Plan"}
                        </span>
                    </div>
                </div>

                {/* Editable fields */}
                <form onSubmit={handleProfileSave} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field
                            id="firstName"
                            label="First Name"
                            placeholder="Jane"
                            {...profileField("firstName")}
                        />
                        <Field
                            id="lastName"
                            label="Last Name"
                            placeholder="Doe"
                            {...profileField("lastName")}
                        />
                    </div>
                    <Field
                        id="username"
                        label="Username"
                        placeholder="janedoe"
                        error={usernameError}
                        {...profileField("username")}
                    />
                    <Field
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="jane@example.com"
                        {...profileField("email")}
                    />

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d28d9] disabled:opacity-60"
                        >
                            {savingProfile ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Save size={15} strokeWidth={2.5} />
                            )}
                            Save Changes
                        </button>
                    </div>
                </form>
            </SectionCard>

            {/* ── Security ─────────────────────────────────────────────── */}
            <SectionCard
                title="Security"
                description="Change your password to keep your account secure."
            >
                <form onSubmit={handlePasswordSave} className="flex flex-col gap-5">
                    <Field
                        id="currentPassword"
                        label="Current Password"
                        type="password"
                        placeholder="••••••••"
                        value={passwords.current}
                        onChange={(e) =>
                            setPasswords((p) => ({ ...p, current: e.target.value }))
                        }
                    />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field
                            id="newPassword"
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.next}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, next: e.target.value }))
                            }
                        />
                        <Field
                            id="confirmPassword"
                            label="Confirm New Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.confirm}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, confirm: e.target.value }))
                            }
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={savingPass}
                            className="flex items-center gap-2 rounded-xl bg-[#0f0b1f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f3a52] disabled:opacity-60"
                        >
                            {savingPass ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Lock size={15} strokeWidth={2.5} />
                            )}
                            Update Password
                        </button>
                    </div>
                </form>
            </SectionCard>

            {/* ── Danger Zone ──────────────────────────────────────────── */}
            <div className="rounded-2xl border border-red-100 bg-white shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]" data-aos="fade-up" data-aos-delay="100">
                <div className="border-b border-red-100 px-6 py-5">
                    <h2 className="flex items-center gap-2 text-base font-bold text-red-500">
                        <AlertTriangle size={16} strokeWidth={2.5} />
                        Danger Zone
                    </h2>
                    <p className="mt-0.5 text-sm text-[#6b6680]">
                        These actions are permanent and cannot be undone.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-5">
                    <div>
                        <p className="text-sm font-semibold text-[#0f0b1f]">
                            Delete Account
                        </p>
                        <p className="text-xs text-[#6b6680]">
                            Permanently delete your account and all your data.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => toast.error("Coming soon.")}
                        className="self-start sm:self-auto rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-100"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

        </div>
    );
}

