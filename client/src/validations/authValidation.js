import * as Yup from "yup";

export const signupSchema = Yup.object({
    firstName: Yup.string()
        .min(2, "First name is too short")
        .required("First name is required"),

    lastName: Yup.string()
        .min(2, "Last name is too short")
        .required("Last name is required"),

    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),

    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain an uppercase letter")
        .matches(/[a-z]/, "Must contain a lowercase letter")
        .matches(/[0-9]/, "Must contain a number")
        .required("Password is required"),
});