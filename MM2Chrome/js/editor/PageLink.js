/* global PageEditor */

var pageLinkUid = 0;

function PageLink(str_, page_) {
    this.id="page-link-"+pageLinkUid;
    pageLinkUid++;
    
    this.page = null;
    if(typeof page_ !== 'undefined') this.page = page_;
    
    if(typeof str_ === 'undefined' || str_ === null || str_.length === 0) {
        if(this.page !== null) this.str = this.page.title;
        else throw "For page link you must specify an str or page.";
    }
    else this.str = str_.trim().toLowerCase();
    
    if(this.page !== null) {
        var that = this;
        this.page.on('titleChanged', function() {
            $("#"+that.id).text("["+that.page.title+"]");
        });
    };
};

PageLink.prototype.getHtml = function() {
    return '<a id="'+this.id+'" href="javascript:;" class="pagelink">['+this.str+']</a>';
};

PageLink.prototype.initOnElement = function(elem$) {
    elem$.attr('id', this.id);
    elem$.addClass("pagelink");
    this.init();
};

PageLink.prototype.init = function() {
    var that = this;
    $("#"+this.id).on('click', function() {
        PageEditor.openInNewWindow(that.getPage());
    });
    
    $("#"+this.id).on('mouseover', function() {
        var page = that.getPage();
        if(page !== null) {
            $("#"+this.id).popover({title: page.title, content: page.body.substr(0, 350), placement: "top"});
        }
        else {
            $("#"+this.id).popover({title: "Page not found", content: "Wolud you like to create?", placement: "top"});
        }
         $("#"+this.id).popover('show');
    });
    
    $("#"+this.id).on('mouseout', function() {
        $("#"+this.id).popover('hide');
    });
};

PageLink.prototype.getPage = function() {
    if(this.page !== null) return this.page;
    else if(this.str !== null && this.str.length > 0) {
       var flatPages = mm().mmTree.flatPages;
       if(typeof flatPages !== 'undefined') {
           for(var k in flatPages) {
               if(flatPages[k].title.trim().toLowerCase() === this.str) {
                   this.page = flatPages[k];
                   return this.page;
               }
               else {
                   var tags = flatPages[k].tags;
                   if(typeof tags !== 'undefined') {
                       for(var kk in tags) {
                           if(tags[kk].trim().toLowerCase() === this.str) {
                                this.page = flatPages[k];
                                return this.page;
                            }
                       }
                   }
               }
           }
       }
       return null;
    }
};