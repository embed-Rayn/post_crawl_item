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

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
      .then(() => {
          console.log('클립보드에 복사되었습니다: ' + text);
      })
      .catch(err => {
          console.error('클립보드 복사 중 오류 발생:', err);
      });
}

function convertOrderDataToString(orderData) {
  // 각 객체의 속성값을 \t로 구분하여 string으로 변환
  return orderData.map(order => {
      return [
          order.orderNumber,
          order.orderDate,
          order.productName,
          order.optionValue,
          order.color,
          order.size,
          order.quantityValue,
          order.priceValue,
          order.imageUrl,
          order.productUrl,
          order.postCompany,
          order.trackingNumber
      ].join('\t'); // 각 속성을 \t으로 구분
  }).join('\n'); // 각 객체는 \n으로 구분
}

document.getElementById('crawlBtn').addEventListener('click', () => {
  try {
      // tp-bought-root div 찾기
      const rootDiv = document.querySelector("#tp-bought-root");

      if (!rootDiv) {
          console.log("Not Found: root_div");
          return;
      }

      // 주문 정보를 저장할 배열
      const orderData = [];
      postCompanyDict = getPostCompany()
      // rootDiv에서 모든 div 탐색
      rootDiv.querySelectorAll('div').forEach((div, div_i) => {
          let orderNumber = '';
          let postCompany = '';
          let trackingNumber = '';
          // 주문번호 찾기
          try {
              orderNumber = div.querySelector("table tbody tr td span:nth-of-type(3)").innerText;
          } catch (err) {
              console.log(`Not Found [order_number]: index ${div_i}`);
          }
          try {
              const postInfo = postCompanyDict[orderNumber];
              postCompany = postInfo.post_company;
              trackingNumber = postInfo.tracking_number;
          } catch (err) {
              console.log(`Not Found [post_info]: index ${div_i}`);
          }

          // 옵션 및 세부 정보 추출
          const optionDetails = div.querySelectorAll("table tbody:nth-of-type(2) tr");

          optionDetails.forEach((optionDetail, opt_idx) => {
              try {
                  const orderDate = optionDetail.querySelector("td div div:nth-of-type(2) p:nth-of-type(4) span:nth-of-type(2)").innerText;
                  const productName = optionDetail.querySelector("td div div:nth-of-type(2) p:nth-of-type(4) span:nth-of-type(2)").innerText;
                  const optionValue = optionDetail.querySelector("td div div:nth-of-type(2) p a span:nth-of-type(2)").innerText;
                  const color = 1;
                  const size = 1;
                  const quantityValue = optionDetail.querySelectorAll("td")[2].querySelector("div p").innerText;
                  const priceValue = optionDetail.querySelectorAll("td")[1].querySelector("div p:last-of-type span:nth-of-type(2)").innerText;
                  const imageUrl = optionDetail.querySelector("td div div:nth-of-type(1) a img").getAttribute("src");
                  const productUrl = optionDetail.querySelector("td div div:nth-of-type(1) a").getAttribute("href");

                  // 각 주문 데이터를 저장
                  orderData.push({
                      orderNumber,
                      orderDate,
                      productName,
                      optionValue,
                      color,
                      size,
                      quantityValue,
                      priceValue,
                      imageUrl,
                      productUrl,
                      postCompany,
                      trackingNumber
                  });
                  
              } catch (err) {
                  console.log(`Not Found [ETC]: index ${opt_idx}`);
              }
          });
          copyToClipboard(convertOrderDataToString(orderData));
      });

      // 크롤링한 주문 데이터를 콘솔에 출력 (또는 저장/전송 가능)
      console.log(orderData);

  } catch (error) {
      console.error('Error during crawling:', error);
  }
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


////*[@id="tp-bought-root"]/div[47]/div[2]/ul/li[6]/a 클릭하여 다음페이지
////*[@id="J_SiteNavLogin"]/div[1]/div/a 텍스트 가져와 ID 추출
