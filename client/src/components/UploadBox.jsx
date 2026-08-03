import Folder from "bootstrap-icons/icons/folder.svg";

export default function UploadBox() {
    return (
        <div className="upload-section">
            <div className="upload-box">
                <div className="upload-icon">
                    <img src={Folder} alt="Upload folder" />
                </div>
                <h3>Drag and drop your file</h3>
                <p>or click to browse from your computer</p>
                <div className="supported-formats">
                    <span>MP3</span>
                    <span>WAV</span>
                    <span>M4A</span>
                    <span>FLAC</span>
                    <span>MP4</span>
                    <span>MOV</span>
                    <span>MKV</span>
                    <span>WEBM</span>
                </div>
            </div>
        </div>
    );
}
