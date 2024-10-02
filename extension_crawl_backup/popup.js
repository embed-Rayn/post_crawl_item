function formatList(list, keyOrder) {
    // 각 dict에 대해 keyOrder 순서대로 값을 추출하고, \t로 구분하여 문자열로 반환
    const formattedList = list.map(dict => {
        return keyOrder.map(key => dict[key] || '').join('\t');
    });
    
    // 각 행을 \n으로 구분하여 최종 문자열 반환
    return formattedList.join('\n');
}



// 모든 콤보박스에 change 이벤트 추가
document.querySelectorAll('select').forEach((comboBox) => {
    comboBox.addEventListener('change', function() {
        const newValue = this.value; // 현재 콤보박스의 새로운 값
        const currentComboBox = this; // 변경된 콤보박스

        // 기존 값을 찾기 위한 배열 순회
        document.querySelectorAll('select').forEach((otherComboBox) => {
            if (otherComboBox !== currentComboBox && otherComboBox.value === newValue) {
                // 이미 선택된 값이 있는 콤보박스를 찾았으므로 값을 서로 교체
                const oldValue = currentComboBox.dataset.previousValue; // 변경 전 값
                otherComboBox.value = oldValue; // 기존 값을 변경
            }
        });

        // 현재 콤보박스의 값을 dataset에 저장하여 이전 값을 추적
        currentComboBox.dataset.previousValue = newValue;
    });

    // 초기 콤보박스의 값을 dataset에 저장하여 추적 시작
    comboBox.dataset.previousValue = comboBox.value;
});

// 페이지가 로드될 때 저장된 값을 불러와 콤보박스에 설정
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['comboBoxValues'], (result) => {
        if (result.comboBoxValues) {
            // 저장된 값이 있으면 각 콤보박스에 값을 적용
            const comboBoxValues = result.comboBoxValues;
            document.querySelectorAll('select').forEach((comboBox, index) => {
                comboBox.value = comboBoxValues[index] || comboBox.value; // 저장된 값이 없으면 기본값 사용
            });
        }
    });
});
// 저장 버튼을 눌렀을 때 콤보박스의 값을 저장
// document.getElementById('saveBtn').addEventListener('click', () => {
//     // 모든 콤보박스의 값을 배열로 저장
//     const comboBoxValues = Array.from(document.querySelectorAll('select')).map(select => select.value);

//     // chrome.storage.local에 값 저장
//     chrome.storage.local.set({ comboBoxValues }, () => {
//         // alert('콤보박스의 값이 저장되었습니다!');
//         alert(comboBoxValues);
//     });
// });



// document.getElementById('crawlBtn').addEventListener('click', () => {
//     // 현재 활성화된 탭에 접근
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs.length === 0) {
//             console.error("No active tabs found.");
//             return;
//         }

//         // 콘텐츠 스크립트를 현재 탭에 주입
//         chrome.scripting.executeScript(
//             {
//                 target: { tabId: tabs[0].id },
//                 files: ['content.js']
//             },
//             () => {
//                 // 스크립트 주입 후 메시지 전송
//                 chrome.tabs.sendMessage(tabs[0].id, { action: "getPostCompany" }, (response) => {
//                     if (chrome.runtime.lastError) {
//                         console.error("Error sending message: ", chrome.runtime.lastError.message);
//                         return;
//                     }

//                     if (response && response.data) {
//                         const receiveData = response.data
//                         const uniqueList = [...new Map(receiveData.map(item => [JSON.stringify(item), item])).values()];
//                         const comboBoxValues = Array.from(document.querySelectorAll('select')).map(select => select.value);
//                         convertedString = formatList(uniqueList, comboBoxValues);
//                         navigator.clipboard.writeText(convertedString)
//                             .then(() => {
//                                 // console.log('클립보드에 데이터가 복사되었습니다.');
//                                 // alert('데이터가 클립보드에 복사되었습니다!');
//                                 alert(uniqueList.length, convertedString)
//                             })
//                             .catch(err => {
//                                 console.error('클립보드 복사 중 오류 발생:', err);
//                             });
//                     } else {
//                         console.error("No response data.");
//                     }
//                 });
//             }
//         );
//     });
// });


// 저장 버튼을 눌렀을 때 콤보박스의 값을 저장
document.getElementById('saveBtn').addEventListener('click', () => {
    // 모든 콤보박스의 값을 배열로 저장
    const comboBoxValues = Array.from(document.querySelectorAll('select')).map(select => select.value);

    // chrome.storage.local에 값 저장
    chrome.storage.local.set({ comboBoxValues }, () => {
        alert(comboBoxValues); // 저장된 값 출력
    });
});

// 크롤 버튼을 눌렀을 때, 현재 활성화된 탭에 접근하여 content.js 주입
document.getElementById('crawlBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.error("No active tabs found.");
            return;
        }

        // content.js 파일을 현재 활성 탭에 주입
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                files: ['content.js']
            },
            () => {
                // 주입 후 메시지 전송
                
                if (chrome.runtime.lastError) {
                    console.error("Error sending message: ", chrome.runtime.lastError.message);
                    return;
                }
                chrome.tabs.sendMessage(tabs[0].id, { action: "getPostCompany" }, (response) => {
                    // 응답을 확인
                    if (response && response.data) {
                        const receiveData = response.data;
                        const uniqueList = [...new Map(receiveData.map(item => [JSON.stringify(item), item])).values()];
                        const comboBoxValues = Array.from(document.querySelectorAll('select')).map(select => select.value);
                        const convertedString = formatList(uniqueList, comboBoxValues);
                        
                        navigator.clipboard.writeText(convertedString)
                            .then(() => {
                                alert('데이터가 클립보드에 복사되었습니다!');
                                console.log("클립보드에 복사된 데이터: ", convertedString);
                            })
                            .catch(err => {
                                console.error('클립보드 복사 중 오류 발생:', err);
                            });
                    } else {
                        console.error("No data received or empty response.");
                    }
                });
            }
        );
    });
});
