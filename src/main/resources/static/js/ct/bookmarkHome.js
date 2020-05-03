(function () {
  var lastConf;

  $.ajaxSetup({
    cache: !mg.defaults.debug,
    error: function (req) {
      if (req.getResponseHeader('catch'))
        mg.notify.error(req.responseJSON.message);
      else {
        console.debug('m=ajax-intercept, status=cannot-catch-error', req)
        if (req.status != 0) {
          mg.notify.error("Temporiamente indisponível...");
        }
      }
    }
  });

// carregando as tags no meu
  $.ajax({
    url: '/api/tag',
    dataType: 'JSON',
    success: function (tags) {
      var container = $(".ulLateralItems"), tpl = $("#tplTagLateralMenu").html();
      tags.map(function (tag) {
        var e = $(Mustache.to_html(tpl, tag));
        e.data("tag", tag);
        container.append(e);
      });
      $(".aMenuLink").click(function () {
        var conf = {
          url: "/api/bookmark/search",
          data: {tag: $(this).data("tag").slug, indice: 0},
          success: function (data) {
            populaTabela(data);
          }
        };
        $.ajax(conf);
        lastConf = conf;
      });
      $(".mg-btn-settings").click(function () {
        mg.popUpScreen2("/static/html/settings.html");
      });
    }
  });

  adaptarTamanhoMenu();
  $('#menu-lateral').on('show.bs.collapse', function () {
    $("#container").addClass("col-sm-10 pull-right");
  }).on('hide.bs.collapse', function () {
    $("#container").removeClass("col-sm-10 pull-right");
  });
  $(window).resize(function () {
    adaptarTamanhoMenu();
  });


  $(".bookmarkNew").click(function (e) {
    if (mg.isMobile) {
      mg.popUpScreen2("/mobile/bookmark/new");
    } else {
      mg.popUpScreen2("/bookmark/new");
    }
  });

  function adaptarTamanhoMenu() {
    $(".ulLateralItems").height($(window).height() - 50);
  }

  window.refreshBookmarkList = function () {
    if (!listar) {
      listar();
    } else {
      $.ajax(lastConf);
    }
  }

// monta a tabela inicial
  function listar() {
    var conf = {
      url: "/api/bookmark",
      dataType: "json",
      success: function (data) {
        populaTabela(data);
      },
      key: 'bookmark-list'
    }

    mg.ajax(conf);

    lastConf = conf;
  };listar();

// busca de bookmarks
  $("#search-form").submit(function (e) {
    e.preventDefault();
    var conf = {
      url: "/api/bookmark/search",
      data: {query: $("#iptSearch").val(), indice: 0},
      success: function (data) {
        populaTabela(data);
      },
      key: 'bookmark-list'
    };
    mg.ajax(conf);
    lastConf = conf;
  })

  function populaTabela(data) {
    var html = $("#tplBookmark").html();
    data.preview = function () {
      if (this.html) {
        return function () {
          return marked(this.html.substring(0, 160) + " ```...```");
        };
      }
      return "";
    }
    var noResults = false;
    if (!data.length) {
      data.push({
        name: "",
        html: "Sem resultados"
      });
      noResults = true;
    }
    $("#tbyBookmark").html(Mustache.to_html(html, data));
    if (noResults) {
      $("#tbyBookmark .divItem .divItemFooter").empty();
    } else {
      eventosTabela();
    }
  }

  function abrirTelaEdicao(e) {
    var that = $(this);
    if (this == e.target || that.hasClass("divItemBody") || that.hasClass("divItemHead")) {
      mg.popUpScreen2(mg.isMobile ? "/mobile/bookmark/edit" : "/bookmark/edit", {
        data: {
          id: that.parents(".divItem").data("id"),
          editMode: true
        }
      });
      mg.clearSelection();
    }
  }

  function eventosTabela() {
    // abre popup de edição
    $("#tbyBookmark .divItemContainer").find(".divItemBody, .divItemHead")
      .dblclick(abrirTelaEdicao)
      .click(abrirTelaEdicao);

    $("#tbyBookmark .divItemBody a").click(function (e) {
        e.stopPropagation();
        this.target = "_blank";
      });

    $("#tbyBookmark .divItemFooter")
      .find(".btnEditBookmark")
      .click(abrirTelaEdicao);

    $("#tbyBookmark .divItem .lnkAddress").click(function (e) {
      var that = $(this);
      if (!that.attr("href") || that.attr("href") == "#") {
        e.preventDefault();
        abrirTelaEdicao.bind(this)(e);
      }
      e.stopPropagation();
    });

    $(".btnRemoveBookmark").click(function (e) {
      e.preventDefault();
      e.stopPropagation();

      var thatLine = $(this).parents(".divItem");
      var id = thatLine.data("id");
      $.ajax({
        url: "/api/bookmark",
        data: JSON.stringify({
          id: id
        }),
        contentType: 'application/json',
        type: "DELETE",
        dataType: "",
        success: function () {
          var remover = true;
          thatLine.fadeOut(500);
          mg.notify.warn("Bookmark deletado, clique pra desfazer...", {
            onClosed: function () {
              if (remover)
                thatLine.remove();
            }
          }).$ele.click(function () {
            remover = false;
            var that = $(this).text("Restaurando....");
            $.ajax({
              url: "/api/bookmark/recover",
              data: JSON.stringify({
                id: id
              }),
              type: "POST",
              contentType: 'application/json',
              success: function () {
                thatLine.fadeIn(500);
                that.remove();
                mg.notify.success("Bookmark restaurado");
              },
              error: function (req) {
                that.remove();
                thatLine.remove();
                mg.notify.error(req.responseJSON.message);
              }
            });
          });
        }
      })
    });

    $('#modal').on('hidden.bs.modal', function () {
      window.onbeforeunload = null;
    });
  }
})();
