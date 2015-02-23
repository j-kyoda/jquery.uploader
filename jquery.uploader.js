/*
 * jQuery uploder v0.0
 * http://makealone.jp/products/jquery.uploader
 *
 * Copyright 2015, makealone.jp
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
    $.fn.uploder = function(options) {
        var undefined;

        // options
        //
        // sel_from -- selector of form for submit
        // sel_dialog -- selector for dialog
        // fn_loadstart -- callback function
        // fn_timeout -- callback function(no test)
        // fn_abort -- callback function(no test)
        // fn_error -- callback function(no test)
        // fn_load -- callback function
        // progress: {"init": "initializing...",
        //            "progress": "sending...",
        //            "loadstart": "starting...",
        //            "timeout": "timeout...",
        //            "abort": "abort.",
        //            "error": "error T_T",
        //            "load": "finish."
        //            }
        //

        // environment
        var isTouchSupported = 'ontouchstart' in window;

        // define
        var defaults = {sel_form: "form",
                        sel_dialog: "#transfer-info",
                        fn_loadstart: (function() {}),
                        fn_timeout: (function() {}),
                        fn_abort: (function() {}),
                        fn_error: (function() {}),
                        fn_load: (function() {}),
                        progress: {"init": "initializing...",
                                   "progress": "sending...",
                                   "loadstart": "starting...",
                                   "timeout": "timeout...",
                                   "abort": "abort.",
                                   "error": "error T_T",
                                   "load": "finish."
                                  }
                       };

        var opts = $.extend(defaults, options);

        // functions
        function set_detail_info(self) {
            var element_file = self[0];
            var file_list = element_file.files;
            var html_part = "";
            html_part += "<table>";
            html_part += "<tr>";
            html_part += "<th>No</th>";
            html_part += "<th>name</th>";
            html_part += "<th>size</th>";
            html_part += "<th>type</th>";
            html_part += "<th>lastModifiedDate</th>";
            html_part += "</tr>";
            $.each(file_list, function(i, file) {
                html_part += "<tr>";
                html_part += "<td style=\"text-align: right\">";
                html_part += i + "</td>";
                html_part += "<td>" + file['name'] + "</td>";
                html_part += "<td style=\"text-align: right\">";
                html_part += file['size'] + "</td>";
                html_part += "<td>" + file['type'] + "</td>";
                html_part += "<td>" + file['lastModifiedDate'] + "</td>";
                html_part += "</tr>";
            });
            html_part += "</table>";

            $(opts.sel_dialog + " div.detail-info").html(html_part);

            $(opts.sel_dialog + " span.link a").click(function (e) {
                e.preventDefault();
                $(opts.sel_dialog + " div.detail-info").toggle();
            });
        };

        function show_dialog(self) {
            $(opts.sel_dialog).show();
            var left = Math.floor(($(window).width()
                                   - $(opts.sel_dialog).width()) / 2);
            var top  = Math.floor(($(window).height()
                                   - $(opts.sel_dialog).height()) / 2);
            $(opts.sel_dialog).css({"top": top,
                                    "left": left,
                                    "opacity": 0
                                   })
                .animate({opacity: 0.8},
                         {queue: true,
                          duration: 500,
                          easing: "linear",
                          complete: function(){
                          }
                         });
        };

        function upload_formdata(self, xhr) {
            var upload = xhr.upload;
            var progress_ = $(opts.sel_dialog + " span.progress");
            var status_ = $(opts.sel_dialog + " span.status");
            progress_.text(opts.progress["init"]);
            upload.onprogress = function(e) {
                progress_.text(opts.progress["loadstart"]);
                var rate = Math.floor(e.loaded / e.total * 100);
                var status = e.loaded + " / " + e.total + " (" + rate + "%)";
                status_.text(status);
            };
            // event when loadstart
            upload.onloadstart = function(e) {
                progress_.text(opts.progress["loadstart"]);
                opts.fn_loadstart(e);
            };
            // event when timeout occur
            upload.ontimeout = function(e) {
                progress_.text(opts.progress["timeout"]);
                opts.fn_timeout(e);
            };
            // event when request abort
            upload.onabort = function(e) {
                progress_.text(opts.progress["abort"]);
                opts.fn_abort(e);
            };
            // event when request error
            upload.onerror = function(e) {
                progress_.text(opts.progress["error"]);
                opts.fn_error(e);
            };
            // event when request success
            upload.onload = function(e) {
                progress_.text(opts.progress["load"]);
                $(opts.sel_dialog).fadeOut(500);
                opts.fn_load(e);
            };

            var form = $(opts.sel_form)[0];
            var form_data = new FormData(form);
            var field_name = self.attr("name");
            form_data.append("field_name", field_name);

            xhr.open(form.method, form.action);
            xhr.send(form_data);
        };

        function change(self) {
            if (! self.val()) {
                return;
            }
            if (window.FormData) {
                var xhr = new XMLHttpRequest();
                if (xhr.upload) {
                    if (window.File) {
                        set_detail_info(self);
                    }
                    show_dialog(self);
                    upload_formdata(self, xhr);
                } else {
                    $(opts.sel_form).submit();
                }
            } else {
                $(opts.sel_form).submit();
            }
            return;
        };

        // containes all method
        var methods = {
            create: function() {
                return this.each(function(i) {
                    var self = $(this);
                    self.change(function (e) {
                        change(self);
                    });
                });
            },
            set_val: function () {
                return this.each(function(i) {
                    var self = $(this);
                    return true;
                });
            }
        };

        // do something
        if (options == 'set_val') {
            return methods.set_val.apply(this);
        } else {
            return methods.create.apply(this);
        }
    };

})(jQuery);
