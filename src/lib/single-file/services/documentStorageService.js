export async function createDocument(request) {
    const IS_DEV = true; // TODO- how to determine this?
    const baseUrl = IS_DEV ? "https://cloud-storage-dev.macro.com" : "https://cloud-storage.macro.com";
    const macroToken = await chrome.cookies.get({ url: "https://macro.com", name: "macro-token"});
    if (!macroToken) throw new Error('macroToken expired');

    const response = await fetch(
        `${baseUrl}/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `${macroToken.name}=${macroToken.value}`
          },
          body: JSON.stringify(request),
        }
      );
    if (!response.ok) throw new Error('dss call did not succceed')
    
    const json = await response.json();    
    return {
        metadata: json.data.documentMetadata,
        presignedUrl: json.data.presignedUrl,
    }
}
