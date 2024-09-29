import pickle
with open("pkl_col.pkl", 'rb') as file:
    excel_order = pickle.load(file)
    print(excel_order)

list_1 = ["주문번호", "주문일자", "상품명", "옵션순서", "색상", "사이즈", "수량", "단가(위안화)", "이미지URL", "상품URL", "운송사", "Traking#"]
print(len(list_1))
with open("pkl_col.pkl", 'wb') as file:
    pickle.dump(list_1, file)
    #excel_order = pickle.load(file)