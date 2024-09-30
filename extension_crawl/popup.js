document.getElementById("crawlBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: getHTMLContent
      }, (results) => {
        if (results && results[0]) {
          const htmlContent = results[0].result;
  
          // HTML 저장하기 (Local Storage 사용)
          chrome.storage.local.set({ html: htmlContent }, () => {
            alert('HTML content saved successfully!');
          });
        } else {
          alert('Failed to retrieve HTML content.');
        }
      });
    });
  });
  
  // 현재 페이지의 HTML을 가져오는 함수
  function getHTMLContent() {
    return document.documentElement.outerHTML;
  }

  // popup.js

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
document.getElementById('saveBtn').addEventListener('click', () => {
    // 모든 콤보박스의 값을 배열로 저장
    const comboBoxValues = Array.from(document.querySelectorAll('select')).map(select => select.value);

    // chrome.storage.local에 값 저장
    chrome.storage.local.set({ comboBoxValues }, () => {
        alert('콤보박스의 값이 저장되었습니다!');
    });
});


function getPostCompany() {
    const postDict = {};
    const listBoughtItems = document.querySelectorAll("#list-bought-items div");

    listBoughtItems.forEach((div, i) => {
        try {
            const prefix = div.querySelector("div > div > div > div:nth-of-type(2) > div");
            const postCompany = prefix.querySelector("div span").innerText;
            const trackingNumber = prefix.querySelectorAll("div span")[2].innerText;
            const orderString = prefix.querySelector("ul li:nth-of-type(3) p span a").getAttribute("href");

            // 정규식을 사용하여 orderId를 추출
            const match = orderString.match(/orderId=(\d+)/);
            if (match) {
                const orderId = match[1];
                postDict[orderId] = { post_company: postCompany, tracking_number: trackingNumber };
            }
        } catch (err) {
            console.log(`Error processing item ${i}:`, err);
        }
    });

    return postDict;
}