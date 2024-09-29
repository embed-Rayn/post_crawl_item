import os
import sys
import time
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtWidgets import *
from PyQt6 import QtGui
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.service import Service
import pyperclip
from bs4 import BeautifulSoup
import re
import pandas as pd
from datetime import datetime
# from template import Ui_Dialog
import pickle
from PyQt6 import uic


def convert_date(date_str):
    match = re.search(r"(\d{2})月(\d{2})日 (\d{2}:\d{2})", date_str)

    if match:
        month = match.group(1)
        day = match.group(2)
        time = match.group(3)

        # 현재 연도
        year = 2024

        # 날짜를 생성
        delivery_date = datetime(year, int(month), int(day)) 

        # 최종 형식으로 변환
        result = delivery_date.strftime(f"%Y-%m-%d {time}")
        return result


Ui_Dialog = uic.loadUiType("gui.ui")[0]

class WindowClass(QMainWindow, Ui_Dialog):
    def __init__(self):
        super().__init__()
        # loadUi("gui.ui", self)
        self.setupUi(self)
        self.setAcceptDrops(True)
        self.setWindowTitle("Post Items")

        self.setFixedWidth(652)
        self.setFixedHeight(519)

        font1 = QtGui.QFont("Arial", 20)
        font2 = QtGui.QFont("굴림체", 11)
        font3 = QtGui.QFont("Arial", 11)
        self.driver = ""
        h1_list = [self.label_01, self.label_02]
        h2_list = [self.label_status]
        h3_list = [self.label_order_1, self.label_order_2, self.label_order_3, self.label_order_4,
                self.label_order_5, self.label_order_6, self.label_order_7, self.label_order_8,
                self.label_order_9, self.label_order_10, self.label_order_11, self.label_order_12]
        self.cb_list = [self.cb_01, self.cb_02, self.cb_03, self.cb_04, self.cb_05, self.cb_06, 
                        self.cb_07, self.cb_08, self.cb_09, self.cb_10, self.cb_11, self.cb_12]
        
        self.column_path = os.path.join(os.path.abspath("."), "pkl_col.pkl")
        with open(self.column_path, 'rb') as file:
            self.excel_order = pickle.load(file)

        [obj.setFont(font1) for obj in h1_list]
        [obj.setFont(font2) for obj in h2_list]
        [obj.setFont(font3) for obj in h3_list]

        [self.cb_list[i].setCurrentText(self.excel_order[i]) for i in range(len(self.excel_order))]
        self.current_values = {cb:cb.currentIndex() for cb in self.cb_list}
        
        self.btn_open.clicked.connect(self.open_browser)
        self.btn_crawl.clicked.connect(self.crawling)
        self.btn_order_save.clicked.connect(self.save_col)

        [obj.currentIndexChanged.connect(self.update_comboboxes) for obj in self.cb_list]
        self.post_company_dict = {}


    def update_comboboxes(self):
        sender = self.sender()
        cb_idx = 0
        for idx, cb in enumerate(self.cb_list):
            if sender == cb:
                selected_index = cb.currentIndex()
                cb_idx = idx
                break
        for cb in  self.cb_list:
            if sender == cb:
                continue
            if selected_index == cb.currentIndex():
                pre_idx = self.current_values[self.cb_list[cb_idx]]
                self.current_values[self.cb_list[cb_idx]] = selected_index
                self.current_values[cb] = pre_idx
                cb.setCurrentIndex(pre_idx)


    def open_browser(self):
        url = "https://world.taobao.com/"
        url = "https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm"
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe --remote-debugging-port=9222 --user-data-dir="C:/ChromeDevSession"'
        chrome_options = Options()
        chrome_options.add_experimental_option("detach", True)
        chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
        # driver = webdriver.Chrome(options=chrome_options)
        driver = webdriver.Chrome(service=Service('chromedriver'), options=chrome_options)
        driver.get(url)
        driver.maximize_window()
        self.driver = driver

    
    def crawling(self):
        html_content = self.driver.page_source  # Get the HTML content
        soup = BeautifulSoup(html_content, 'html.parser')
        self.post_company_dict = self.get_post_company(soup)
        root_div = soup.find("div", id="tp-bought-root")
        # ["주문번호", "주문일자", "상품명", "옵션순서", "색상", "사이즈", "수량", "단가(위안화)", "이미지URL", "상품URL", "운송사", "Traking#"]
        # [ "상품명", "옵션순서", "색상", "사이즈", "수량", "단가(위안화)", "이미지URL", "상품URL"]\
        data_list = []
        for div_i, div in enumerate(root_div.find_all("div")):
            try:
                order_number = div.find("table").find("tbody").find("tr").find("td").find_all("span")[2].text
            except AttributeError:
                print(f"Not Found [order_number]: index {div_i}")
            try:
                post_info = self.post_company_dict[order_number]
                post_company = post_info["post_company"]
                traking_number = post_info["traking_number"]
            except AttributeError:
                print(f"Not Found [post_info]: index {div_i}")
            # //*[@id="tp-bought-root"]/div[37]/div/table/tbody[2]/tr[1]
            option_details = div.find("table").find_all("tbody")[1].find_all("tr")
            for opt_idx, option_detail in enumerate(option_details):
                try:
                    # //*[@id="tp-bought-root"]/div[12]/div/table/tbody[2]/tr/td[1]/div/div[2]/p[4]/span[2]
                    # //*[@id="tp-bought-root"]/div[50]/div/table/tbody[2]/tr/td[1]/div/div[2]/p[2]/span[1]/span[3]
                    # //*[@id="tp-bought-root"]/div[50]/div/table/tbody[2]/tr/td[1]/div/div[2]/p[2]/span[2]/span[3]
                    order_date = option_details.find("td").find("div").find_all("div")[1].find_all("p")[3].find_all("span")[1].text
                    order_date = convert_date(order_date)
                    product_name = option_details.find("td").find("div").find_all("div")[1].find_all("p")[3].find_all("span")[1].text
                    option1_value = option_details.find("td").find("div").find_all("div")[1].find("p").find("a").find_all("span")[1].text
                    color = option_details.find("td").find("div").find_all("div")[1].find_all("p")[1].find_all("span")[1].find_all("span")[2].text
                    size = option_details.find("td").find("div").find_all("div")[1].find_all("p")[1].find("span").find_all("span")[2].text
                    quantity_value = option_details.find_all("td")[2].find("div").find("p").text
                    price_value = option_details.find_all("td")[1].find("div").find_all("p")[-1].find_all("span")[1].text
                    image_url = option_details.find("td").find("div").find_all("div")[0].find("a").find("img")["src"]
                    product_url = option_details.find("td").find("div").find_all("div")[0].find("a")["href"]
                    data_list.append({
                        "order_date": order_date,
                        "product_name": product_name,
                        "option1_value": option1_value,
                        "color": color,
                        "size": size,
                        "quantity_value": quantity_value,
                        "price_value": price_value,
                        "image_url": image_url,
                        "product_url": product_url
                    })
                except AttributeError:
                    print(f"Not Found [ETC]: index  {opt_idx}")


    def copy_clipboard(self, df):
        pass
    

    def save_col(self):
        self.excel_order = [cb.currentText() for cb in self.cb_list]
        
        with open(self.column_path, 'wb') as file:
            pickle.dump(self.excel_order, file)


    def get_post_company(soup):
        post_dict ={}
        list_bought_items = soup.find(id="list-bought-items").find_all("div")

        for i, div in enumerate(list_bought_items):
            try:
                prefix = div.find("div").find("div").find("div").find_all("div")[1].find("div")
                post_company = prefix.find("div").find("span").text
                traking_number = prefix.find("div").find_all("span")[2].text
                order_string = prefix.find("ul").find_all("li")[2].find("p").find("span").find("a")["href"]
                match = re.search(r"orderId=(\d+)", order_string)
                # if match:
                order_id = match.group(1)
                post_dict[order_id] = {"post_company": post_company, "traking_number":traking_number}
            except:
                pass
        return post_dict


if __name__ == "__main__":
    app = QApplication(sys.argv)
    myWindow = WindowClass()
    myWindow.show()
    app.exec()