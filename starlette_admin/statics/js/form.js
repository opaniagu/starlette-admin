$("select.field-tags, select.field-enum").each(function () {
  $(this).select2();
});

$("div.field-json").each(function () {
  let name = $(this).attr("id");
  new JSONEditor(
    this,
    {
      mode: "tree",
      modes: ["code", "tree"],
      onChangeText: function (json) {
        $(`input[name=${name}]`).val(json);
      },
    },
    JSON.parse($(`input[name=${name}]`).val())
  );
});


$(':input[data-role="file-field-delete"]').each(function () {
  let el = $(this);
  related = $(`#${el.data("for")}`);
  related.on("change", function () {
    if (related.get(0).files.length > 0) {
      el.prop("checked", false);
      el.prop("disabled", true);
    } else {
      el.prop("checked", false);
      el.prop("disabled", false);
    }
  });
});

$("select.field-has-one, select.field-has-many").each(function () {
  let el = $(this);
  el.select2({
    allowClear: true,
    ajax: {
      url: el.data("url"),
      dataType: "json",
      data: function (params) {
        return {
          skip: ((params.page || 1) - 1) * 20,
          limit: 20,
          select2: true,
          where: params.term,
        };
      },
      processResults: function (data, params) {
        return {
          results: $.map(data.items, function (obj) {
            obj.id = obj[el.data("pk")];
            return obj;
          }),
          pagination: {
            more: (params.page || 1) * 20 < data.total,
          },
        };
      },
      cache: true,
    },
    minimumInputLength: 0,
    templateResult: function (item) {
      if (!item.id) return "Search...";
      return $(item._select2_result);
    },
    templateSelection: function (item) {
      if (!item.id) return "Search...";
      if (item._select2_selection) return $(item._select2_selection);
      return $(item.text);
    },
  });
  data = String(el.data("initial"));
  if (data!="")
    $.ajax({
      url: el.data("url"),
      data: {
        select2: true,
        pks: data.split(","),
      },
      traditional: true,
      dataType: "json",
    }).then(function (data) {
      for (obj of data.items) {
        obj.id = obj[el.data("pk")];
        var option = new Option(obj._select2_selection, obj.id, true, true);
        el.append(option).trigger("change");
        el.trigger({
          type: "select2:select",
          params: {
            data: obj,
          },
        });
      }
    });
});
