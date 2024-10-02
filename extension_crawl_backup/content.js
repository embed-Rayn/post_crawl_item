// hover 함수: 마우스 오버 이벤트를 트리거하는 함수
async function hover() {
    document.querySelectorAll('#viewLogistic').forEach((element) => {
        // 마우스 hover(hover) 이벤트 트리거
        const mouseOverEvent = new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: true,
            view: window
        });
    
        // 각 요소에 mouseover 이벤트 발생
        element.dispatchEvent(mouseOverEvent);
    });

    // DOM 업데이트가 완료되기를 잠시 기다림
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
}

// get_post_info 함수: 배송 정보를 추출하는 함수
function get_post_info() {
    const postDict = {};
    const listBoughtItems = document.querySelectorAll("#list-bought-items div");
    try{
        listBoughtItems.forEach((div, i) => {
            try {
                const prefix = div.querySelector("div div div div:nth-of-type(2) div");
                const postCompany = prefix.querySelector("div span").innerText;
                const trackingNumber = prefix.querySelectorAll("div span")[2].innerText;
                const orderString = prefix.querySelector("ul li:nth-of-type(3) p span a").getAttribute("href");
                
                // 정규식을 사용하여 orderId를 추출
                const match = orderString.match(/orderId=(\d+)/);
                if (match) {
                    const orderId = match[1];
                    postDict[orderId] = { post_company: postCompany, tracking_number: trackingNumber };
                }
            } 
            catch (err) 
            {
                console.log(`Error processing item ${i}:`, err);
            }
        })
    } catch (err){

};

    console.log(postDict);
    return postDict;
}

// getPostCompany 함수: hover 이벤트 후 배송 정보를 추출하는 함수
async function getPostCompany() {
    // hover 이벤트 트리거
    await hover();

    // hover 후, DOM 변경이 완료되면 get_post_info 실행
    const postDict = await get_post_info();
    return postDict;
}

// crawling 함수: 배송 정보를 사용하여 주문 데이터를 추출하는 함수
function crawling(postCompanyDict) {
    const tabaoID = document.querySelector("#J_SiteNavLogin div div a").innerText;
    console.log(tabaoID);

    // tp-bought-root div 찾기
    const rootDiv = document.querySelector("#tp-bought-root");

    // 주문 정보를 저장할 배열
    const orderData = [];

    // rootDiv에서 모든 div 탐색
    rootDiv.querySelectorAll('div').forEach((div, div_i) => {
        try {
            const orderNumber = div.querySelector("table tbody tr td span:nth-of-type(3)").innerText;
            const orderDate = div.querySelector("table tbody tr td label span:nth-of-type(2)").innerText;
            try {
                const postInfo = postCompanyDict[orderNumber];
                const postCompany = postInfo.post_company;
                const trackingNumber = postInfo.tracking_number;
                const optionDetails = div.querySelectorAll("table tbody:nth-of-type(2) tr");

                optionDetails.forEach((optionDetail, opt_idx) => {
                    let color = "";
                    let size = "";
                    try {
                        const productName = optionDetail.querySelector("td div div:nth-of-type(2) p a span:nth-of-type(2)").innerText;
                        const optionValue = (opt_idx + 1).toString();
                        try {
                            color = optionDetail.querySelector("td div div:nth-of-type(2) p:nth-of-type(2) span span:nth-of-type(3)").innerText;
                        } catch (err) {
                            console.log("color 없음");
                        }
                        try {
                            size = optionDetail.querySelector("td div div:nth-of-type(2) p:nth-of-type(2) span:nth-of-type(2) span:nth-of-type(3)").innerText;
                        } catch (err) {
                            console.log("size 없음");
                        }
                        const quantityValue = optionDetail.querySelectorAll("td")[2].querySelector("div p").innerText;
                        const priceValue = optionDetail.querySelectorAll("td")[1].querySelector("div p:last-of-type span:nth-of-type(2)").innerText;
                        const imageUrl = optionDetail.querySelector("td div div:nth-of-type(1) a img").getAttribute("src").replace(/_\d+x\d+\.\w+$/, '');
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
            } catch (err) {
                console.log(`Not Found [post_info]: index ${div_i}`);
            }
        } catch (err) {
            // console.log(`Not Found [order_number]: index ${div_i}`);
        }
    });

    // 크롤링한 주문 데이터를 콘솔에 출력 (또는 저장/전송 가능)
    console.log(orderData);
    return orderData;
}

// 메시지를 수신하고, 함수들을 순차적으로 호출
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.action === "getPostCompany") {
            try {
                // getPostCompany가 완료될 때까지 기다림
                const postCompanyData = await getPostCompany();

                // postCompanyData를 기반으로 crawling 함수 실행
                const sendData = crawling(postCompanyData);

                // 응답 전송
                sendResponse({ data: sendData });
            } catch (error) {
                console.error('Error during crawling:', error);
                sendResponse({ error: error.message });
            }

            // 비동기 응답을 사용하기 위해 true 반환
            return true;
        }
    });
