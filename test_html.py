from bs4 import BeautifulSoup

# HTML 파일 불러오기
with open("test_sample_html.html", "r", encoding="utf-8") as file:
    html_content = file.read()

# BeautifulSoup 객체 생성
soup = BeautifulSoup(html_content, "html.parser")

root_div = soup.find("div", id="tp-bought-root")

# 결과를 저장할 리스트
extracted_data = []
# ["주문번호", "주문일자", "상품명", "옵션순서", "색상", "사이즈", "수량", "단가(위안화)", "이미지URL", "상품URL", "운송사", "Traking#"]
# 모든 div 태그에 대해 반복
for i, div in enumerate(root_div.find_all("div")):
    try:
        order_number = div.find("table").find("tbody").find("tr").find("td").find_all("span")[2].text
    except AttributeError:
        print(f"Not Found [order_number]: index {i}")
        continue
    # 택배사 찾기


    for i in range(2):
        pass
        # 2개 이상일 때 로직
    try:
        # //*[@id="tp-bought-root"]/div[12]/div/table/tbody[2]/tr/td[1]/div/div[2]/p[4]/span[2]
        order_date = div.find("table").find_all("tbody")[1].find("tr").find("td").find("div").find_all("div")[1].find_all("p")[3].find_all("span")[1].text
        # # 옵션1의 값 추출
        option1_value = div.find_all("tbody")[1].find("tr").find("td").find("div").find_all("div")[1].find("p").find("a").find_all("span")[1].text
        
        # # 가격 추출
        price_value = div.find_all("tbody")[1].find("tr").find_all("td")[1].find("div").find_all("p")[-1].find_all("span")[1].text
        
        # # 수량 추출
        quantity_value = div.find_all("tbody")[1].find("tr").find_all("td")[2].find("div").find("p").text
        
        # # 상품URL 추출
        product_url = div.find_all("tbody")[1].find("tr").find("td").find("div").find_all("div")[0].find("a")["href"]
        
        # # 이미지URL 추출
        image_url = div.find_all("tbody")[1].find("tr").find("td").find("div").find_all("div")[0].find("a").find("img")["src"]
        print(order_number, price_value)
        # 추출된 데이터를 딕셔너리로 저장
        # extracted_data.append({
        #     "Order Number": order_number,
        #     "Option 1": option1_value,
        #     "Price": price_value,
        #     "Quantity": quantity_value,
        #     "Product URL": product_url,
        #     "Image URL": image_url
        # })

    except AttributeError:
        print(f"Warning: Structure not found in div index {i}")

# 추출된 데이터를 CSV 파일로 저장
with open("extracted_data.csv", "w", newline='', encoding="utf-8") as csvfile:
    fieldnames = ["Order Number", "Option 1", "Price", "Quantity", "Product URL", "Image URL"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    writer.writerows(extracted_data)

# 결과 출력 (파일에 저장된 결과를 확인하기 위해)
print("Extracted data:", extracted_data)
