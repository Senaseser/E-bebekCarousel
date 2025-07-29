$(function () {

  const HOMEPAGE_URL = "/Users/senaeser/Desktop/case/test.html";
  
  const isHomepage = () => {
    return (
      window.location.pathname === HOMEPAGE_URL
    );
  };

  const init = () => {
    if (!isHomepage()) {
      console.log("wrong page");
      return;
    }
    buildHTML();
    buildCSS();
    loadProducts();
    setCardDetailEvents();
    setFavoriteEvents();
    setAddToCartEvents();
    setCarouselEvents();
  };

  const CONFIG = {
    API_URL:
      "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json",
    STORAGE_KEY_FAVORİTES: "favorites",
    STORAGE_KEY_PRODUCTS: "products",
    CAROUSEL_TITLE: "Beğenebileceğinizi düşündüklerimiz",
  };

  const buildHTML = () => {
    const html = `
            <div class="container">
                <h2 class="title">${CONFIG.CAROUSEL_TITLE}</h2>
                <button class="arrow left"> &lt;</button>   
                <div class="carousel">  
                    <div class="product-list"></div>
                </div>    
                <button class="arrow right"> &gt;</button>
            </div>
        `;
    $(".product-detail").append(html);
  };

  const buildProductHTML = (product) => {
    const favorites = JSON.parse(
      localStorage.getItem(CONFIG.STORAGE_KEY_FAVORITES) || "[]"
    );
    const isFavorite = favorites.includes(product.id);

    let price = product.price;
    let discount = "";
    if (product.original_price !== product.price) {
      const discountPercent = Math.round(
        ((product.original_price - product.price) / product.original_price) *
          100
      );
      discount = `<span class="original-price">${product.original_price}</span>
            <span class="discount-rate">${discountPercent}% ↓</span>`;
    }

    const rating = (Math.random() * 4 + 1).toFixed(1);
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = "";

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHTML += '<span class="star full">★</span>';
      } else if (i === fullStars && hasHalfStar) {
        starsHTML += '<span class="star half">★</span>';
      } else {
        starsHTML += '<span class="star empty">☆</span>';
      }
    }
    return `
    <div class="product-card" data-id="${product.id}" data-product-url="${product.url}">
        <img class="icon" src="https://www.e-bebek.com/assets/images/cok-satan@2x.png" alt="icon" />
        <span class="fav-icon ${isFavorite ? "favorite" : ""}" >${isFavorite ? "♥" : "♡"}</span>
        <img src="${product.img}" alt="${product.name}" />
        <div class="product-info">
            <h2><span class="product-brand">${product.brand} - </span> ${product.name}</h2>
                <div class="rating">${starsHTML}<span class="rating-text">(${rating})</span>
                </div>
                <div class="discount">${discount ? discount : ""}</div>
                <p class="${discount ? "low-price" : "price"}">${price}</p>
                <button class="add-product">Sepete Ekle</button>
        </div>
    </div>
        `;
  };

  const loadProducts = () => {
    const cachedProducts = localStorage.getItem(CONFIG.STORAGE_KEY_PRODUCTS);
    if (cachedProducts) {
      try {
        const products = JSON.parse(cachedProducts);
        let html = "";
        products.forEach((product) => {
          html += buildProductHTML(product);
        });
        $(".product-list").append(html);
      } catch (error) {
        console.log("Error: parsing cached products", error);
        fetchFromAPI();
      }
    } else {
      fetchFromAPI();
    }
  };

  const fetchFromAPI = () => {
    fetch(CONFIG.API_URL)
      .then((response) => response.json())
      .then((data) => {
        const products = Array.isArray(data) ? data : data.products || [];

        localStorage.setItem(
          CONFIG.STORAGE_KEY_PRODUCTS,
          JSON.stringify(products)
        );

        let html = "";
        products.forEach((product) => {
          html += buildProductHTML(product);
        });
        $(".product-list").append(html);
      })
      .catch((error) => {
        console.error("Error: fetching data", error);
      });
  };

  const setCardDetailEvents = () => {
    $("body").on("click", ".product-card", function () {
      const url = $(this).data("product-url");
      if (url && url !== "#") {
        window.open(url, "_blank");
      }
    });
  };

  const setFavoriteEvents = () => {
    $("body").on("click", ".fav-icon", function (e) {
      e.stopPropagation();
 
      const card = $(this).closest(".product-card");
      const productId = card.data("id");

      let favorites = JSON.parse(
        localStorage.getItem(CONFIG.STORAGE_KEY_FAVORITES) || "[]"
      );

      if (favorites.includes(productId)) {
        favorites = favorites.filter((id) => id !== productId);
        $(this).removeClass("favorite").text("♡");
      } else {
        favorites.push(productId);
        $(this).addClass("favorite").text("♥");
      }
      localStorage.setItem(
        CONFIG.STORAGE_KEY_FAVORITES,
        JSON.stringify(favorites)
      );
    });
  };

  const setAddToCartEvents = () => {
    $("body").on("click", ".add-product", function (e) {
      e.stopPropagation();
      console.log("Sepete eklendi");
    });
  };

  const setCarouselEvents = () => {
    $(".arrow.left").on("click", function () {
      $(".carousel").animate({ scrollLeft: "-=240" }, 300);
    });
    $(".arrow.right").on("click", function () {
      $(".carousel").animate({ scrollLeft: "+=240" }, 300);
    });
  };

  const buildCSS = () => {
    const css = `
            @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap');
            
            .container {  
                max-width:65%;             
                padding: 0 20px;
                position: relative;
                display: flex;
                flex-direction: column;
                font-family: 'Quicksand', sans-serif;
                margin: 40px auto;
            }
            .title{
                color:#ee8c02;
                padding-right:100px;
                text-align:left;
                font-family: 'Quicksand', sans-serif;
                font-weight: 700;
                background-color:#fff6eb;
                border:1px solid transparent;
                border-radius: 30px 30px 0 0;
                padding: 20px 60px;
            }
            .carousel{
                min-width:0px;
                overflow-x: hidden;
                overflow-y: hidden;
                width: 100%;
                scrollbar-width: none;
                -ms-overflow-style: none;
                scrollbar-color: transparent transparent;
            }
            .product-list {
                width: 100%;
                padding-right:0;
                padding-left:0; 
                display: flex;
                flex-wrap: nowrap;
                gap: 12px;
                margin-top: 20px;
            }
            .product-card {
                background: #fff;
                border-radius: 8px;                
                min-width: 190px;
                max-width: 190px;
                height:400px;
                padding: 16px;
                display: flex;
                flex-direction: column;
                align-items: center;
                transition: box-shadow 0.1s;
                position: relative;
                z-index: 1;
                font-family: 'Quicksand', sans-serif;
                border:2px solid #ededed;
                padding-top: 50px;
            }
            .product-card:hover {
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                border:2px solid #f08e00;
                transition: all 0.1s ease;
            }
            .product-card img {
                width: 120px;
                height: 120px;
                object-fit: contain;
                margin-bottom: 30px;
            }
            .icon{
                position: absolute;
                top: 15px;
                left: 20px;
                width: 48px !important;
                height: 48px !important;
                z-index: 1000;
                pointer-events: none;
            }
            .discount{
                position:absolute;
                bottom:120px;
                width:82%;
                display: flex;
                align-items: center;
                justify-content:space-start;
            }
            .product-info{
                display: flex;
                flex-direction:column;
                align-items: center;
                justify-content:center;
            }
            .product-info h2 {
                font-weight: normal;
                font-size: 14px;
                margin: 0 0 8px 0;
                text-align: start;
            }
            .original-price {
                color: #909090;
                text-decoration: line-through;
                font-size: 16px;
                margin-right: 12px;
            }
            .product-info .price {
                position:absolute;
                bottom:60px;
                left:20px;
                color: #646465;
                font-weight: bold;
                font-size: 25px;
            }
            .product-info .low-price {
                position:absolute;
                bottom:60px;
                left:20px;
                margin-top:5px;
                color: #00a065;
                font-weight: bold;
                font-size: 25px;
            }
            .discount-rate{
                bottom:85px;
                left:20px;
                color:#00a065;
                font-weight: bolder;
                font-size: 18px;
            }
            .rating {
                position:absolute;
                bottom:140px;
                left:20px;
                display: flex;
                align-items: center;
                justify-content:start !important;
                gap: 4px;
                margin-bottom: 8px;
            }
            .star {
                font-size: 16px;
                color: #ddd;
            }
            .star.full {
                color: #ffd700;
            }
            .star.half {
                color: #ffd700;
                opacity: 0.7;
            }
            .rating-text {
                font-size: 12px;
                color: #666;
                margin-left: 4px;
            }  
            .add-product {
                position: absolute;
                bottom: 15px;
                left: 20px;
                right: 20px;
                background-color: #fff6eb;
                color: #f08e00;
                border: none;
                border-radius: 15px;
                padding: 10px 15px;
                font-family: 'Quicksand', sans-serif;
                font-weight: bold;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.1s ease;
            }
            .add-product:hover {
                background-color: #f08e00;
                transform: translateY(-1px);
                color:#fff6eb;
            }
            .product-brand {
                font-weight: bold;
                font-size: 16px;
            }
            .fav-icon {
                position: absolute;
                 box-shadow: 0 2px 10px rgba(0,0,0,0.07);
                top: 15px;
                right: 20px;
                 width: 24px;
                height: 24px;
                border-radius:100%;
                transition: all 0.1s ease;
                background-color:#fff;
                color: #f08e00;
                display: flex;
                align-items: center;
                justify-content:center;
                padding:4px;
                font-size: 18px;
                cursor: pointer;
                z-index: 1000;
                border:1px solid transparent;
            }
            .fav-icon:hover{
                transition: all 0.1s ease;
                border:1px solid #f08e00;
            }
            .fav-icon.favorite{
               font-size: 18px;
            }
            .arrow {
               color: #f08e00;
               position: absolute;
               top: 60%;
               transform: translateY(-50%);
               z-index: 10;
               background: #fff;
               border: none;
               font-size: 32px;
               cursor: pointer;
               padding: 0 10px;
               border-radius: 50%;
               box-shadow: 0 2px 8px rgba(0,0,0,0.07);
               opacity: 0.7;
               transition: opacity 0.1s;
               display:flex;
               justify-content:center;
               background-color:#fff6eb;
               border:1px solid transparent;
            }
            .arrow.left { left: -40px; }
            .arrow.right { right: -40px; }
            .arrow:hover { 
               background-color:transparent;
               transition: all 0.1s ease;
               border:1px solid #f08e00;
            }
        @media (max-width: 1200px) {
            .product-card {
                min-width: 180px;
                max-width: 180px;
            }
            .container {
                max-width: 75%;
                font-size: 15px;
            }
        }
        @media (max-width: 900px) {
            .product-card {
                min-width: 200px;
                max-width: 200px;
            }
            .container {
                max-width: 80%;
                font-size: 14px;
            }
        }
        @media (max-width: 700px) {
            .product-card {
                min-width: 250px;
                max-width: 250px;
            }
            .container {
                max-width: 90%;
                font-size: 12px;
            }
        }     
            `;
    $("<style>").addClass("carousel-css").html(css).appendTo("head");
  };

  init();

});
