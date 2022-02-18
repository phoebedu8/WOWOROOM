const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-tableList');
let productData = [];
let cartData = [];

//初始化
function init(){
  getProductList();
  getCartList();
}
init();

//撈axios資料
function getProductList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
   .then(function (response){
    productData = response.data.products;
    renderProductList();
  })
 }

//重複的程式碼整理成函式 （組字串）
function combineProductHTMLItem(item){
  return `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img src="${item.images}" alt="">
          <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
          <p class="nowPrice">NT$${toThousands(item.price)}</p>
          </li>`;
}

 //productData 8筆
 function renderProductList(){
  let str = "";
  productData.forEach(function(item){
    str+=combineProductHTMLItem(item);
  })
  productList.innerHTML = str;
 }

//下拉選單邏輯
productSelect.addEventListener('change',function(e){
  const category = e.target.value;
  if(category=='全部'){
    renderProductList();
    return;
  }
  let str = "";
  productData.forEach(function(item){
  //  跑出每8筆的資料 對應 目前change點到的地方。
    if(item.category==category){
      str+=combineProductHTMLItem(item);
    }
    productList.innerHTML = str;
  })
 })

 //加入購物車邏輯
 productList.addEventListener('click',function(e){
   e.preventDefault();
   let addCartClass = e.target.getAttribute("class");
   if(addCartClass!=="addCardBtn"){
     alert('沒有點擊到該位置');
     return;
   }

  //加入購物車流程
  let productId = e.target.getAttribute("data-id"); 
  let numCheck = 1;

  cartData.forEach(function(item){
    if(item.product.id === productId){
      numCheck = item.quantity+=1;
    }
  })
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  }).then(function(response){
    alert("加入購物車");
    getCartList();
  })
 })

 //取得目前購物車列表
 function getCartList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function (response){
    document.querySelector('.js-total').textContent = toThousands(response.data.finalTotal);

    cartData = response.data.carts;
    let str = "";
    cartData.forEach(function(item){
      str+=`<tr>
          <td>
            <div class="cardItem-title">
              <img src="${item.product.images}" alt="">
              <p>${item.product.title}</p>
            </div>
          </td>
          <td>NT$${toThousands(item.product.price)}</td>
          <td>${item.quantity}</td>
          <td>NT$${toThousands(item.product.price * item.quantity)}</td>
          <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}">
              clear
          </a>
          </td>
        </tr>`
    });
    cartList.innerHTML = str;
  })
 }
//購物車列表刪除
 cartList.addEventListener('click',function(e){
   e.preventDefault();
   const cartId = e.target.getAttribute("data-id");
  if(cartId==null){
    alert("你點擊到其他區域");
    return;
  }
  console.log(cartId);
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
  .then(function(response){
    alert("刪除單筆購物車成功");
    getCartList();
  })
 })
//刪除全部購物車流程
 const discardAllBtn = document.querySelector('.discardAllBtn');
 discardAllBtn.addEventListener('click',function(e){
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function(response){
    alert("刪除全部購物車成功");
    getCartList();
  })
  .catch(function(response){
    alert("購物車已清空，請勿重複點擊");
  })
 })

//送出訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener("click",function(e){
  e.preventDefault();
  if(cartData.length==0){
    alert("請加入購物車");
    return;
  }
  const customerName = document.querySelector('#customerName').value;
  const customerPhone = document.querySelector('#customerPhone').value;
  const customerEmail = document.querySelector('#customerEmail').value;
  const customerAddress = document.querySelector('#customerAddress').value;
  const customerTradeWay = document.querySelector('#tradeWay').value;
  console.log(customerName,customerPhone,customerEmail,customerAddress,customerTradeWay);

  if(customerName=="" || customerPhone=="" || customerEmail=="" || customerAddress=="" || customerTradeWay==""){
    alert("請勿輸入空資訊");
    return;
  }
  if(validateEmail(customerEmail)==false){
    alert("請填寫正確的Email");
    return;
  }

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  }).then(function(response){
    alert("訂單建立成功");
    document.querySelector('#customerName').value="";
    document.querySelector('#customerPhone').value="";
    document.querySelector('#customerEmail').value="";
    document.querySelector('#customerAddress').value="";
    document.querySelector('#tradeWay').value="ATM";
    getCartList();
  })
})

const customerEmail = document.querySelector('#customerEmail');
customerEmail.addEventListener("blur",function(e){
  if(validateEmail(customerEmail.value)==false){
    document.querySelector(`[data-message=Email]`).textContent = "請填寫正確 Email 格式";
    return;
  }
})

//util js、元件
function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join("."); 
}
//mail驗證
function validateEmail(mail) {
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
    return true
  }
    return false;
}
//phone驗證
function validatePhone(phone){
  if(/^[09]{2}\d{8}$/.test(phone)){
    return true
  }
  return false;
}
