/**
 * Helper to convert seconds into HH:MM:SS,mmm format for SRT
 */
const formatSrtTime = (timeInSeconds) => {
    const pad = (num, size) => ("000" + num).slice(-size);
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
    
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(milliseconds, 3)}`;
};

/**
 * Helper to convert seconds into H:MM:SS.cs format for ASS
 */
const formatAssTime = (timeInSeconds) => {
    const pad = (num, size) => ("00" + num).slice(-size);
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const centiseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(centiseconds, 2)}`;
};

/**
 * Generate SRT file content from segments
 */
export const generateSrt = (segments) => {
    if (!segments || segments.length === 0) return "";
    
    return segments.map((segment, index) => {
        const start = formatSrtTime(segment.start);
        const end = formatSrtTime(segment.end);
        return `${index + 1}\n${start} --> ${end}\n${segment.text.trim()}\n`;
    }).join("\n");
};

/**
 * Generate ASS file content from segments
 */
export const generateAss = (segments) => {
    if (!segments || segments.length === 0) return "";
    
    let ass = "[Script Info]\n";
    ass += "Title: CaptionFlow Transcription\n";
    ass += "ScriptType: v4.00+\n";
    ass += "Collisions: Normal\n";
    ass += "PlayDepth: 0\n\n";
    
    ass += "[V4+ Styles]\n";
    ass += "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n";
    ass += "Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1\n\n";
    
    ass += "[Events]\n";
    ass += "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n";
    
    segments.forEach((segment) => {
        const start = formatAssTime(segment.start);
        const end = formatAssTime(segment.end);
        ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${segment.text.trim()}\n`;
    });
    
    return ass;
};
