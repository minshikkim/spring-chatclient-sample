




/************************** 서버로 부터 가져온 데이터를 화면에 렌더링 하는 메서드들 ****************************/

/**
 * @param {*} products
 * 서버로 부터 받아온 products 데이터를 화면에 나타냅니다
 */
function renderProducts(products){
  $(function () {
      var tbody = $('#product-table-body');
      $.each(products, function (i, product) {

          console.log(product.id);
          console.log(product.title);
          console.log(product.seller);
          var product_link = "/product/" + product.id;

          $('<tr>').prop('id', product.id).append(
              $('<td>').text(product.id),
              $('<td>').text(product.title),
              $('<td>').text(product.userEntity['userNickname']),
              $('<td>').append('<a href="' + product_link + '">' + '상세보기' + '</a>'))
              .appendTo(tbody);
      });
  });
}


 /***************************************** 네트워크 rest api 요청 **************************************************/

 /**
  *  사용자가 올린 모든 물건 데이터를 가져온다.
  */
function getProducts() {
  $.ajax({
    cache: true,
    url: "http://localhost:8080/api/v1/product",
    type: 'GET',
    success: function (products) {
        console.log(products);
        renderProducts(products)
    }
  })  
}



getProducts();
// let products = getProducts();
// renderProducts(products);
