// ==UserScript==
// @name         Complete with Comment
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Custom button to mark Trello card as completed, move it to a specific column, and set a due date with a comment
// @author       Андрей Яценко
// @match        https://trello.com/*
// @grant        GM_xmlhttpRequest
// @updateURL    https://raw.githubusercontent.com/crymory/test/blob/main/CompleteWithComment.user.js
// ==/UserScript==

(function() {
    'use strict';

    const apiKey = '9bac3f053d62b776b10ea9ee43863172';
    const apiToken = '94ef54658e87d1f1688f38cb0569502d617e8b005d8605487ccc3384da079f15';
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
