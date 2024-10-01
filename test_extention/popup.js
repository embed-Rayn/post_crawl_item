document.getElementById('testBtn').addEventListener('click', () => {
    // 현재 활성화된 탭에 접근
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.error("No active tabs found.");
            return;
        }

        // 콘텐츠 스크립트를 현재 탭에 주입
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                files: ['content.js']
            },
            () => {
                // 스크립트 주입 후 메시지 전송
                chrome.tabs.sendMessage(tabs[0].id, { action: "getPostCompany" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message: ", chrome.runtime.lastError.message);
                        return;
                    }

                    if (response && response.data) {
                        const dictToString = JSON.stringify(response.data);
                        console.log(dictToString);

                        // 클립보드에 복사
                        navigator.clipboard.writeText(dictToString)
                            .then(() => {
                                console.log('클립보드에 데이터가 복사되었습니다.');
                                alert('데이터가 클립보드에 복사되었습니다!');
                            })
                            .catch(err => {
                                console.error('클립보드 복사 중 오류 발생:', err);
                            });
                    } else {
                        console.error("No response data.");
                    }
                });
            }
        );
    });
});

document.getElementById('crawlBtn').addEventListener('click', () => {
    // 현재 활성화된 탭에 접근
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.error("No active tabs found.");
            return;
        }

        // 콘텐츠 스크립트를 현재 탭에 주입
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                files: ['content.js']
            },
            () => {
                // 스크립트 주입 후 메시지 전송
                chrome.tabs.sendMessage(tabs[0].id, { action: "nextButton" }, (response) => {
                    alert("완료");
                });
            }
        );
    });
});