(function ($) {
    $.fn.autocomplete = function (data, options) {

        options = $.extend({
            type: "without arrow",
            favorites: false
        }, options);

        var make = function () {
            var input = $(this);

            input.after("<ul class='autocomplete__option-list'></ul>");
            var list = input.next(".autocomplete__option-list");

            if (options.type == "with arrow") {
                list.addClass("option-list_with-arrow");
            } else {
                list.addClass("option-list_without-arrow");
            }

            var found = [];
            var currentListElem;
            var currentListElemIndex;
            var numberOfVariants;
            var numberInDataArr = "empty";
            var isInputDone = false;
            var isListEmpty = false;
            var currentScroll = 0;

            if (options.type == "with arrow") {
                var listItemHeight = 27;
                var originalHeight = list.height();
            }

            function isEmpty() {
                return !$.trim(list.html())
            }

            function capitalize(s) {
                return s[0].toUpperCase() + s.slice(1);
            }

            if (options.favorites) {
                var favoritesArr = [
                    {
                        "Id": 4980,
                        "City": "Екатеринбург"
                    },
                    {
                        "Id": 4948,
                        "City": "Саратов"
                    },
                    {
                        "Id": 2428,
                        "City": "Астрахань"
                    }
                ]
            }

            list.on('mousewheel DOMMouseScroll', function (e) {
                var e0 = e.originalEvent;
                var delta = e0.wheelDelta || -e0.detail;

                this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
                e.preventDefault();
            });

            input.focus(function () {
                if ($(this).val() != "") {
                    $(this).select();
                }

                if ($(this).hasClass("autocomplete-input_invalid")) {
                    $(this).removeClass("autocomplete-input_invalid");
                    $(this).next(".autocomplete__invalid-text").remove();
                }

                if (options.type == "with arrow") {
                    list.empty();
                    if (options.favorites) {
                        for (var k = 0; k < favoritesArr.length; k++) {
                            list.append("<li class='autocomplete__list-item'>" + favoritesArr[k].City + "</li>");
                        }
                        list.append("<div class='autocomplete__option-list-separator'></div>");
                    }

                    for (var i = 0; i < data.length; i++) {
                        list.append("<li class='autocomplete__list-item'>" + data[i].City + "</li>");
                    }

                    if (currentListElemIndex) {
                        currentScroll = listItemHeight * currentListElemIndex;
                        list.scrollTop(currentScroll);
                        currentListElem = list.children().eq(currentListElemIndex);
                        currentListElem.addClass("option-list_current");
                    }

                    if (currentScroll) {
                        list.scrollTop(currentScroll);
                    }

                    if (list.height() != originalHeight) {
                        list.height(originalHeight);
                    }
                    numberInDataArr = "empty";

                    list.show();
                } else {

                    if (options.favorites && isEmpty()) {
                        list.append("<p class='autocomplete__list-hint list-hint_top'>Популярные города</p>");
                        for (var j = 0; j < favoritesArr.length; j++) {
                            list.append("<li class='autocomplete__list-item'>" + favoritesArr[j].City + "</li>");
                        }
                    }

                    if ((options.favorites || $(this).val() != "") && !isInputDone) {
                        list.show();
                    }

                }
            });

            input.blur(function () {
                if (found.length == 1) {
                    input.val(found[0].City);
                    found = [];
                } else if (!isInputDone) {
                    $(this).addClass("autocomplete-input_invalid");
                    $(this).after("<div class='autocomplete__invalid-text'>Выберите значение из списка</div>");
                }
                list.hide();
            });

            input.on("input", function () {
                var key = $(this).val();

                if (key != "") {
                    key = capitalize(key);
                    found = JSON.search(data, '//*[starts-with(City, "' + key + '")]');
                    list.show();

                    if (found.length) {
                        if (isListEmpty) {
                            isListEmpty = false;
                        }

                        if (!isEmpty()) {
                            list.empty();
                        }
                        numberOfVariants = found.length;

                        if (options.type == "without arrow") {
                            if (numberOfVariants > 5) {
                                numberOfVariants = 5;
                            }

                            for (var i = 0; i < numberOfVariants; i++) {
                                list.append("<li class='autocomplete__list-item'>" + found[i].City + "</li>");
                            }
                        } else if (options.type == "with arrow") {
                            for (var i = 0; i < numberOfVariants; i++) {
                                list.append("<li class='autocomplete__list-item'>" + found[i].City + "</li>");
                            }

                            if (numberOfVariants * list.children().eq(0).height() < originalHeight) {
                                list.height(Math.ceil(numberOfVariants * list.children().eq(0).height()))
                            } else if (list.height() != originalHeight) {
                                list.height(originalHeight);
                            }
                            currentScroll = 0;
                            list.scrollTop(currentScroll);
                        }

                        list.children(":first").addClass("option-list_current");
                        currentListElem = list.children(":first");

                        if (found.length > numberOfVariants && options.type == "without arrow") {
                            list.append("<p class='autocomplete__list-hint'>Показано " + numberOfVariants + " из " + found.length + " вариантов. Уточните запрос, чтобы увидеть остальные</p>")
                        }

                    } else {
                        isListEmpty = true;

                        list.empty();
                        if (options.type == "with arrow") {
                            list.height(listItemHeight);
                        }
                        list.append("<p class='option-list_empty'>Не найдено</p>");
                    }
                } else if (key == "") {

                    if (options.type == "with arrow") {
                        list.empty();
                        list.height(originalHeight);
                        for (var j = 0; j < data.length; j++) {
                            list.append("<li class='autocomplete__list-item'>" + data[j].City + "</li>");
                        }
                    } else {
                        if (options.favorites) {
                            list.empty();
                            list.append("<p class='autocomplete__list-hint list-hint_top'>Популярные города</p>");
                            for (var j = 0; j < favoritesArr.length; j++) {
                                list.append("<li class='autocomplete__list-item'>" + favoritesArr[j].City + "</li>");
                            }
                            list.show();
                        } else {
                            isInputDone = false;
                            list.hide();
                        }

                    }
                }

            });

            input.on("keydown", function (event) {
                switch (event.keyCode) {
                    case 38: //up
                        event.preventDefault();
                        if (currentListElem && currentListElem.prev().is("li")) {
                            currentListElem.removeClass("option-list_current");
                            currentListElem.prev().addClass("option-list_current");
                            currentListElem = currentListElem.prev();

                            console.log(currentScroll);
                            if (currentListElem.position().top < 0) {
                                currentScroll += Math.ceil(currentListElem.position().top);
                                list.scrollTop(currentScroll);
                            }

                        }
                        break;

                    case 40: //down
                        event.preventDefault();
                        if (currentListElem && currentListElem.next().is("li")) {
                            currentListElem.removeClass("option-list_current");
                            currentListElem.next().addClass("option-list_current");
                            currentListElem = currentListElem.next();

                            console.log(currentScroll);
                            if (currentListElem.position().top + currentListElem.height() > list.height()) {
                                currentScroll += Math.ceil(currentListElem.position().top + currentListElem.height() - list.height());
                                list.scrollTop(currentScroll);
                            }

                        }
                        break;

                    case 13: //enter
                        event.preventDefault();
                        if (!isListEmpty) {
                            list.hide();
                            var selectedValue = currentListElem[0].textContent;
                            input.val(selectedValue);
                            currentListElemIndex = $(this).index();
                            isInputDone = true;
                            input.blur();
                        }
                        break;

                    case 27: //escape
                        list.hide();
                        break;
                }
            });

            list.on('mouseenter', 'li', function () {
                if (currentListElem) {
                    currentListElem.removeClass("option-list_current");
                }
                $(this).addClass("option-list_current");
                currentListElem = $(this);
                currentListElemIndex = currentListElem.index();
            });

            list.on('mousedown', 'li', function () {
                isInputDone = true;
                var selectedValue = $(this)[0].textContent;
                input.val(selectedValue);
                list.hide();
            });

        };

        return this.each(make);

    };
})(jQuery);