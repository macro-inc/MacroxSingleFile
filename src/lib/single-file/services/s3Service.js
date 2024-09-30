
import { getSHA } from "./utils";

function getMimeType(fileType) {
    switch (fileType) {
        case 'pdf':
            return 'application/pdf';
        case 'html':
            return 'text/html';
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}

export async function uploadFileToPresignedUrl(presignedUrl, content, fileType) {
    const blob = new Blob([content], { type: fileType });
  
    const sha = await getSHA(content);
    const base64Sha = btoa(
        sha
            .match(/\w{2}/g)
            .map((a) => String.fromCharCode(parseInt(a, 16)))
            .join('')
    );
  
    const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
            'Content-Type': getMimeType(fileType),
            'x-amz-checksum-sha256': base64Sha,
        },
        signal: null,
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to upload file: ${text}`);
    }
}
