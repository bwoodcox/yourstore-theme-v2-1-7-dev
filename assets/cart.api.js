/* override functions api.jquery.js */
Shopify.onItemAdded = function(line_item) {
  Shopify.getCart();
};

Shopify.onCartUpdate = function(cart) {
  Shopify.cartUpdateInfo(cart, '.cart-group-1 ul');
};

Shopify.onError = function(XMLHttpRequest, textStatus) {
  var data = eval('(' + XMLHttpRequest.responseText + ')');
  if (!!data.message) {
    var str = data.description;
  } else {
   	var str = 'Error : ' + Shopify.fullMessagesFromErrors(data).join('; ') + '.';
  }
  jQuery('#modalAddToCartError .error_message').text(str);
  jQuery('#modalAddToCartError').modal("toggle");
}

Shopify.addItem = function(variant_id, quantity, callback) {
  var quantity = quantity || 1;
  var params = {
    type: 'POST',
    url: '/cart/add.js',
    data: 'quantity=' + quantity + '&id=' + variant_id,
    dataType: 'json',
    success: function(line_item) {
      if ((typeof callback) === 'function') {
        callback(line_item);
      }
      else {
        Shopify.cartPopap(variant_id);
        Shopify.onItemAdded(line_item);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

Shopify.addItemFromForm = function(form_id, variant_id,callback) {
    var params = {
      type: 'POST',
      url: '/cart/add.js',
      beforeSend: function(){
        if(form_id == "add-item-qv") {
          jQuery('#' + form_id).find(".addtocartqv").html(jQuery(".quickViewModal_info .button_wait").html());
        }
      },
      data: jQuery('#' + form_id).serialize(),
      dataType: 'json',
      success: function(line_item) {
        if ((typeof callback) === 'function') {
          callback(line_item);
        }
        else {
          if(form_id != "add-item-qv") {
            Shopify.cartPopapForm(variant_id);
          } else {
          	jQuery('#' + form_id).find(".addtocartqv").html(jQuery(".quickViewModal_info .button_added").html());
            jQuery('#' + form_id).find(".addtocartqv").addClass("added_in_cart");
            setTimeout(function(){
              	jQuery('#' + form_id).find(".addtocartqv").removeClass("added_in_cart");
            	jQuery('#' + form_id).find(".addtocartqv").html(jQuery(".quickViewModal_info .button").html());
            }, 2000);
          }
          Shopify.onItemAdded(line_item);
        }
      },
      error: function(XMLHttpRequest, textStatus) {
        if(form_id != "add-item-qv") {
          Shopify.onError(XMLHttpRequest, textStatus);
        } else {
          jQuery('#' + form_id).find(".addtocartqv").html(jQuery(".quickViewModal_info .button_error").html());
          jQuery('#' + form_id).find(".addtocartqv").addClass("error_in_cart");
          setTimeout(function(){
            jQuery('#' + form_id).find(".addtocartqv").removeClass("error_in_cart");
            jQuery('#' + form_id).find(".addtocartqv").html(jQuery(".quickViewModal_info .button").html());
          }, 2000);
        }
      }
    };
    jQuery.ajax(params);
};

Shopify.removeItemByLine = function(line, callback) {
  var params = {
    type: "POST",
    url: "/cart/change.js",
    data: "quantity=0&line=" + line,
    dataType: "json",
    success: function(line) {
      "function" == typeof callback ? callback(line) : Shopify.onCartUpdate(line)
    },
    error: function(line, callback) {
      Shopify.onError(line, callback)
    }
  };
  jQuery.ajax(params);
};

/* user functions */

Shopify.addItemFromFormStart = function(form, product_id) {
  Shopify.addItemFromForm(form, product_id);
}

Shopify.cartPopap = function(variant_id) {
  	var title = jQuery('.'+variant_id+':first .product_title').text();
  	jQuery('.productmsg').text('');
  	jQuery('#modalAddToCart').modal("toggle");
}
Shopify.cartPopapForm = function(variant_id) {
  	var title = jQuery('.product-info__title:first h2').text();
	jQuery('.productmsg').text('');
	jQuery('#modalAddToCart').modal("toggle");
}

Shopify.cartUpdateInfo = function(cart, cart_cell_id) {
  var formatMoney = "<span class='money'>${{amount_no_decimals}}</span>";
  if ((typeof cart_cell_id) === 'string') {
    var cart_cell = jQuery(cart_cell_id);
    if (cart_cell.length) {

      cart_cell.empty();

      jQuery.each(cart, function(key, value) {
        if (key === 'items') {

          if (value.length) {
            jQuery('.cart_message').hide();

            var table = jQuery(cart_cell_id);
            jQuery.each(value, function(i, item) {
              if(i > 19){
                  return false;
              }
              var line = i + 1;
              var options_block;
              if (item.properties) {
                options_block = '<div class="cart__meta-text">';
                Object.keys(item.properties).forEach(function(key) {
                  options_block += '<div class="cart-property"><span class="hulkapps_option_name">' + key + '</span>';
                  if (item.properties[key].includes(',')) {
                    options_block += '<div>';
                    item.properties[key].split(",").forEach(function(value) {
                      options_block += value + '<br />';
                    });
                    options_block += '</div>';
                  } else if (item.properties[key].includes("/uploads/") || item.properties[key].includes(".jpg") ||
                            item.properties[key].includes(".png") || item.properties[key].includes(".jpeg") ||
                            item.properties[key].includes(".svg")) {
                              if (item.properties[key].includes("_|_")) {
                                var prop_val = item.properties[key].split("_|_");
                                var swatch_val = prop_val[0].replace("http://","")
                                  .replace(/&amp;amp;amp;/g,"&amp;amp;")
                                  .replace(/&amp;amp;lt;/g,"<")
                                  .replace(/&amp;amp;gt;/g,">");
                                var swatch_image = prop_val[1];
                                var data_original_title = '<div style=\'padding:5px 0px; text-align:center;width:170px;\'><div class=\'swatch_tooltip_title\'>' + swatch_val +
                                '</div><div class=\'swatch_tooltip_data\' style=\'width:100%;height:150px;background-image:url(' + swatch_image +
                                ');background-size:cover;background-position: center center;\'></div></div>';
                                options_block += '<span class="hulkapps_option_value" style="cursor: pointer;"><div style="width:35px;height:35px;background-image:url(' + swatch_image +
                                  ');background-size:cover;background-position: center center;" title="" data-placement="top" data-original-title="' + data_original_title + '" data-html="true" data-toggle="tooltip"></div></span><br />';
                              } else {
                                options_block += '<span class="hulkapps_option_value"><a class="lightbox" href="' + item.properties[key] + '">Uploaded File</a></span><br />';
                              }
                  } else {
                    options_block += '<span class="hulkapps_option_value">' + item.properties[key].replace(/&amp;amp;amp;/g,"&amp;amp;")
                      .replace(/&amp;amp;lt;/g,"<")
                      .replace(/&amp;amp;gt;/g,">") + '</span><br />';
                  }
                  options_block += "</div>";
                });
                options_block += "</div>";
              }
              jQuery('<li class="cart__item"><div class="cart__item__image pull-left"><img src="' + item.image + '" alt=""/> </div><div class="cart__item__control"><div class="cart__item__delete"><a href="javascript:void(0);" onclick="Shopify.removeItemByLine(' + line + ');" class="icon icon-delete"><span>'+jQuery(".cart_messages .delete").text()+
              '</span></a></div></div><div class="cart__item__info"><div class="cart__item__info__title"><h2 class="title-center">' + item.title + options_block + '<div class="cart__meta-text"></h2></div><div class="cart__item__info__price"><span class="info-label">'+jQuery(".cart_messages .price").text()+'</span><span>' + Shopify.formatMoney(item.price, formatMoney) + '</span></div><div class="cart__item__info__price" style="right: 35%;"><span class="info-label">'+
              jQuery(".cart_messages .qty").text()+'</span><span>' + item.quantity + '</span></div></div></li>').appendTo(table);
            });
          }
          else {
            jQuery('.cart_message').show();
          }
        }
      });
      $('[data-toggle="tooltip"]').tooltip();
    }
  }

  changeHtmlValue(".shopping-cart__total", Shopify.formatMoney(cart.total_price, formatMoney));
  changeHtmlValue(".bigcounter", cart.item_count);

  jQuery('.currency .active').trigger('click');
}

// for (var j = 0; j < Object.keys(item.properties).length; j++) {
//   option_key = Object.keys(item.properties)[j];
//   item_title = item_title.concat('<br />',option_key.replace('-',' '),':');
//   values = item.properties[option_key].split(',');
//   for (var k = 0; k < values.length; k++) {
//     item_title = item_title.concat('<br />',values[k]);
//   }
// }

//Utils
function changeHtmlValue (cell, value) {
  var $cartLinkText = jQuery(cell);
  $cartLinkText.html(value);
};
