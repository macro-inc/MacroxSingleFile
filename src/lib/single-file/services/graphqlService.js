const userPermissionsQuery = `
    query userPermissions {
      me {
        __typename
        id
        permissions
      }
    }
`;

export async function getUserId() {
    const sessionIdToken = await chrome.cookies.get({ url: "https://api-dev.macro.com", name: "sessionId"});
    if (!sessionIdToken) throw new Error('sessionIdToken expired');

    const response = await fetch('https://api-dev.macro.com/graphql/', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': `${sessionIdToken.name}=${sessionIdToken.value}`
        },
        body: JSON.stringify({
            query: userPermissionsQuery
        }) 
    });
    if (!response.ok) throw new Error('graphql call did not succeeed');

    const data = await response.json();
    return data.data.me.id; 
}
