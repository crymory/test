// ==UserScript==
// @name         Complete Button
// @namespace    https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&name=Server%20Token&key=9bac3f053d62b776b10ea9ee43863172
// @version      1.1
// @description  Для работы скрипта нужно скопировать свой АpiToken
// @author       rage-
// @match        https://trello.com/*
// @grant        GM_xmlhttpRequest
// @updateURL    https://raw.githubusercontent.com/crymory/trello-helpdesk/main/scriptWorkflow/complete.js
// ==/UserScript==

(function() {
    'use strict';

    const apiKey = '9bac3f053d62b776b10ea9ee43863172';
    const apiToken = ''; //заменить на свой
    const targetColumnId = '6114c997aa179187690bce8f';

    function moveCard(cardId, commentText) {
        const url = `https://api.trello.com/1/cards/${cardId}`;
        const dueDate = new Date();
        const data = {
            idList: targetColumnId,
            key: apiKey,
            token: apiToken,
            due: dueDate.toISOString(),
            dueComplete: true
        };

        GM_xmlhttpRequest({
            method: 'PUT',
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
            onload: function(response) {
                if (response.status === 200) {
                    console.log('Card moved successfully:', response.responseText);
                    addComment(cardId, 'Выполнено - ' + dueDate.toLocaleString());
                    if (commentText) {
                        addComment(cardId, commentText);
                    }
                    moveCardToTop(cardId);
                } else {
                    console.error('Error moving card:', response.statusText);
                }
            },
            onerror: function(error) {
                console.error('Error moving card:', error);
            }
        });
    }

    function addComment(cardId, commentText) {
        const commentUrl = `https://api.trello.com/1/cards/${cardId}/actions/comments`;
        const commentData = {
            text: commentText,
            key: apiKey,
            token: apiToken,
        };

        GM_xmlhttpRequest({
            method: 'POST',
            url: commentUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(commentData),
            onload: function(response) {
                if (response.status === 200) {
                    console.log('Comment added successfully:', response.responseText);
                } else {
                    console.error('Error adding comment:', response.statusText);
                }
            },
            onerror: function(error) {
                console.error('Error adding comment:', error);
            }
        });
    }

    function moveCardToTop(cardId) {
        const cardElement = $(`[data-id="${cardId}"]`);
        const listElement = cardElement.closest('.list-cards');
        listElement.prepend(cardElement);
    }

    function createCustomButton() {
        const existingButton = document.getElementById('customButton');
        if (existingButton) {
            return; // If the button already exists, do nothing
        }

        const sidebar = document.querySelector('.card-detail-data');
        if (!sidebar) {
            setTimeout(createCustomButton, 500);
            return;
        }

        const buttonHtml = '<div id="customButton" style="cursor: pointer; background-color: #3CB371; color: #fff; padding: 6px 12px; width: 85px; border-radius: 5px; margin-left: 150px; font-weight: bold;">Выполнено</div>';
        sidebar.appendChild(new DOMParser().parseFromString(buttonHtml, 'text/html').body.firstChild);

        const customButton = document.getElementById('customButton');
        if (customButton) {
            customButton.addEventListener('click', function() {
                const cardId = window.location.pathname.split('/')[2];
                const commentText = prompt('Добавьте комментарий (необязательно):');
                moveCard(cardId, commentText);
            });
        }
    }

    function observeChanges() {
        const targetNode = document.getElementById('content'); // Adjust based on Trello's DOM structure
        const observerOptions = {
            childList: true,
            subtree: true
        };

        const observer = new MutationObserver(function(mutationsList) {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    createCustomButton();
                }
            }
        });

        observer.observe(targetNode, observerOptions);
    }

    function waitForPageLoad() {
        if (document.readyState === 'complete') {
            createCustomButton();
            observeChanges();
        } else {
            setTimeout(waitForPageLoad, 500);
        }
    }

    waitForPageLoad();

})();
