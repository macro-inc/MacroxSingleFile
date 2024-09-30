/*
 * Copyright 2010-2020 Gildas Lormeau
 * contact : gildas.lormeau <at> gmail.com
 * 
 * This file is part of SingleFile.
 *
 *   The code in this file is free software: you can redistribute it and/or 
 *   modify it under the terms of the GNU Affero General Public License 
 *   (GNU AGPL) as published by the Free Software Foundation, either version 3
 *   of the License, or (at your option) any later version.
 * 
 *   The code in this file is distributed in the hope that it will be useful, 
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of 
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero 
 *   General Public License for more details.
 *
 *   As additional permission under GNU AGPL version 3 section 7, you may 
 *   distribute UNMODIFIED VERSIONS OF THIS file without the copy of the GNU 
 *   AGPL normally required by section 4, provided you include this license 
 *   notice and a URL through which recipients can access the Corresponding 
 *   Source.
 */

import "./browser-polyfill/chrome-browser-polyfill.js";
import "./fetch/bg/fetch.js";
import "./frame-tree/bg/frame-tree.js";
import "./lazy/bg/lazy-timeout.js";

import { createDocument } from "./services/documentStorageService";
import { getUserId } from "./services/graphqlService";
import { uploadFileToPresignedUrl } from "./services/s3Service";
import { getSHA, stringToArrayBuffer } from "./services/utils";

const BASE_LOCALHOST_URL = 'http://localhost:3000/app';

console.log('background.js');
const testCookieRetrieval = async () => {
    const sessionIdToken = await chrome.cookies.get({ url: "https://api-dev.macro.com", name: "sessionId"});
    console.log(sessionIdToken);
}
testCookieRetrieval();

const uploadHtmlDocumentAndRedirect = async (filename, content) => {
    const testHtml = stringToArrayBuffer(content);
  
    try {
      // get user id from graphql
      const userId = await getUserId();
  
      // create dss document
      const sha = await getSHA(testHtml);
      const testCreateDocumentRequest = { 
        sha,
        documentName: filename,
        owner: userId, 
        fileType: "html",
      }
      const { metadata, presignedUrl } = await createDocument(testCreateDocumentRequest);
  
      // upload to s3
      await uploadFileToPresignedUrl(new URL(presignedUrl), testHtml, testCreateDocumentRequest.fileType);
  
      // redirect
      const interceptUrl = `${BASE_LOCALHOST_URL}/html/${metadata.documentId}`;
      await chrome.tabs.create({ url: interceptUrl });
    } catch (e) {
      // TODO: delete dss document if upload to s3 fails
      console.error(e);
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendHtml") {
    uploadHtmlDocumentAndRedirect(message.filename, message.content);
    return true; // Indicates that the response is sent asynchronously
  }
});
