// ==UserScript==
// @name         Take In Progress
// @namespace    https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&name=Server%20Token&key=9bac3f053d62b776b10ea9ee43863172
// @version      1.0
// @description  Для того чтобы скрипт работал нужно заменить на свой ApiToken и TeamMemberUsername
// @author       rage-
// @match        https://trello.com/*
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/crymory/test/raw/main/scriptWorkflow/takeInProgress.js
// ==/UserScript==

(function () {
    'use strict';

    const apiKey = '9bac3f053d62b776b10ea9ee43863172';
    const apiToken = ''; //заменить на свой
    const targetColumnId = '6114c997aa179187690bce8e';
    const teamMemberUsername = ''; // заменить на свой

    function takeInProgress(cardId) {
        const url = `https://api.trello.com/1/cards/${cardId}/actions/comments`;
        const currentDate = new Date();
        const commentText = `Взято в работу - ${currentDate.toLocaleString()}`;

        const data = {
            text: commentText,
            key: apiKey,
            token: apiToken,
        };

        GM_xmlhttpRequest({
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
            onload: function (response) {
                if (response.status === 200) {
                    console.log('Comment added successfully:', response.responseText);
                    moveCardInProgress(cardId);
                } else {
                    console.error('Error adding comment:', response.statusText);
                }
            },
            onerror: function (error) {
                console.error('Error adding comment:', error);
            }
        });
    }

    function moveCardInProgress(cardId) {
        const url = `https://api.trello.com/1/cards/${cardId}`;
        const data = {
            idList: targetColumnId,
            key: apiKey,
            token: apiToken,
            idMembers: [teamMemberUsername],
        };

        GM_xmlhttpRequest({
            method: 'PUT',
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
            onload: function (response) {
                if (response.status === 200) {
                    console.log('Card moved to "In Progress" successfully:', response.responseText);
                } else {
                    console.error('Error moving card to "In Progress":', response.statusText);
                }
            },
            onerror: function (error) {
                console.error('Error moving card to "In Progress":', error);
            }
        });
    }

        function createTakeInProgressButton() {
        const existingButton = document.getElementById('takeInProgressButton');
        if (existingButton) {
            return; // If the button already exists, do nothing
        }

        const sidebar = document.querySelector('.card-detail-data');
        if (!sidebar) {
            setTimeout(createTakeInProgressButton, 500);
            return;
        }

        const buttonHtml = '<div id="takeInProgressButton" style="cursor: pointer; position: absolute; background-color: #3498db; color: #fff; padding: 6px 12px; width: 110px; border-radius: 5px; font-weight: bold;">Взять в работу</div>';
        sidebar.appendChild(new DOMParser().parseFromString(buttonHtml, 'text/html').body.firstChild);

        const takeInProgressButton = document.getElementById('takeInProgressButton');
        if (takeInProgressButton) {
            takeInProgressButton.addEventListener('click', function () {
                const cardId = window.location.pathname.split('/')[2];
                takeInProgress(cardId);
            });
        }
    }

    function observeChanges() {
        const targetNode = document.getElementById('content'); // Adjust based on Trello's DOM structure
        const observerOptions = {
            childList: true,
            subtree: true
        };

        const observer = new MutationObserver(function (mutationsList) {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    createTakeInProgressButton();
                }
            }
        });

        observer.observe(targetNode, observerOptions);
    }

    function waitForPageLoad() {
        if (document.readyState === 'complete') {
            createTakeInProgressButton();
            observeChanges();
        } else {
            setTimeout(waitForPageLoad, 500);
        }
    }

    waitForPageLoad();

})();
