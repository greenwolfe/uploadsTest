//make some blocks that are group or section editable?
//add button bar with copy block ... add to an array so cold
//copy several blocks and then paste them into another column
  /**********************/
 /******* HELPERS ******/
/**********************/
var enabledState = function() {
  var data = Template.parentData();
  if (!data) return 'disabled';
  var wallID = data.wallID || null;
  if (!wallID) return 'disabled';
  var editedWall = Session.get('editedWall');
  if (!editedWall) return 'disabled';
  return (editedWall == wallID) ? 'enabled' : 'disabled';
}
var inEditedWall = function(gen) {
  gen = gen || 1;
  return (Session.get('editedWall') == Template.parentData(gen).wallID) ? 'inEditedWall' : '';
}
var validateFiles = function(files) {
  return (_.max(_.pluck(files,'size')) < 1e8);  //100MB
}
//to use:  genericCallbacks: {validate: validateFiles},

  /**********************/
 /******* BLOCK** ******/
/**********************/


Template.block.helpers({
  blockType: function() {
    return Template[this.type + 'Block'];
  },
  inEditedWall: inEditedWall,
  enabledState: enabledState,
  fileCount: function() {
    var selector = {blockID:this._id};
    if (!inEditedWall()) //if not editing
      selector.visible = true //show only visible blocks
    return Files.find(selector).count();
  },
  virtualWorkStatus: function() {
    return 'icon-raise-virtual-hand';
  },
});

Template.block.events({
  'click .deleteBlock':function() {
    if (confirm('Are you sure you want to delete this block?')) {
      Meteor.call('deleteBlock', this._id);
    }
  },
  'click .copyBlock': function(event,tmpl) {
    if (!event.ctrlKey) { //clear the clipboard
      ClipboardBlocks.find().forEach(function(block) {
        ClipboardBlocks.remove(block._id);
      });
    } //else do nothing ... add block to clipboard
    var block = this;
    block.idFromCopiedBlock = block._id;
    block.order = ClipboardBlocks.find().count() + 1;
    delete block._id;
    delete block.columnID;
    ClipboardBlocks.insert(block);
  }
});

  /**********************/
 /***** EDITTITLE ******/
/**********************/
Template.editTitle.onRendered(function() {
  var block = this.data;
  var blockTitle = $(this.find('.blockTitle'));
  var saveText = function(event) { //make helper at top?
    Meteor.call('updateBlock',{
      _id:block._id,
      title:blockTitle.code()
    });
    //thinking about adding a save/cancel button instead
/*    console.log(event)
    var popoverSelector = event.target.id.replace('note-editor-','#note-popover-')
    //fix bug so popover menu is dismissed when focus is lost
    popoverSelector += ' .note-air-popover';
    $(popoverSelector).css('display','none');*/
  }
  this.autorun(function() { 
    var eS = enabledState();
    if (eS == 'enabled') {
      blockTitle.summernote({
        onblur: saveText,
        airMode: true,
        airPopover: [
          ['color', ['color']],
          ['fontname', ['fontname']],
          ['fontsize', ['fontsize']],
          ['supersub', ['superscript','subscript','hello']],
          ['decorations', ['bold', 'italic', 'underline', 'clear']],
          ['para', ['paragraph']],
          ['insert', ['link']],
          ['other', ['undo','redo']],
          ['hide',['hide']]
        ]
      });
    } else if (eS == 'disabled') {
      blockTitle.destroy();
    }
  })
})

Template.editTitle.helpers({
  enabledState: enabledState,
  inEditedWall: inEditedWall
});

/*Template.editTitle.events({
  'click .saveEdits': function(event,tmpl) {
    console.log('saving edits');
    var blockTitle = $(tmpl.find('.blockTitle'));
    Meteor.call('updateBlock',{
      _id:this._id,
      title:blockTitle.code()
    });
  },
  'focus .summernote': function(event) {
    event.preventDefault(); 
    event.stopPropagation();
    return false;
  }
})*/

  /**********************/
 /***** TEXTBLOCK ******/
/**********************/
Template.textBlock.onRendered(function() {
  var block = this.data;
  var blockText = $(this.find('.blockText'));
  //var popover = $(blockText.popover());
  var saveText = function(event) { //make helper at top?
    Meteor.call('updateBlock',{
      _id:block._id,
      text:blockText.code()
    });
    //thinking about adding save/cancel button instead
    /*var clickedOn = event.explicitOriginalTarget||document.activeElement;
    console.log(clickedOn);
    var popoverSelector = event.target.id.replace('note-editor-','#note-popover-')
    //fix bug so popover menu is dismissed when focus is lost
    popoverSelector += ' .note-air-popover';
    $(popoverSelector).css('display','none');*/
  }
  this.autorun(function() { 
    var eS = enabledState();
    if (eS == 'enabled') {
      blockText.summernote({
        onblur: saveText,
        airMode: true,
        airPopover: [
          ['color', ['color']],
          ['fontname', ['fontname']],
          ['fontsize', ['fontsize']],
          ['supersub', ['superscript','subscript']],
          ['font', ['bold', 'italic', 'strikethrough', 'underline', 'clear']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['insert', ['link', 'picture','video']],
          ['undoredo', ['undo','redo']],
          ['other',['codeview','fullscreen','help','hide']]
        
        ]
      });
    } else if (eS == 'disabled') {
      blockText.destroy();
    }
  })
})

Template.textBlock.helpers({
  enabledState: enabledState,
  inEditedWall: inEditedWall
});

Template.textBlock.events({
  'click saveEdits': function(event) {
    var blockText = $(Template.find('.blockText'));
    Meteor.call('updateBlock',{
      _id:this._id,
      text:blockText.code()
    });
  }
})

  /**********************/
 /**** EMBEDBLOCK ******/
/**********************/

Template.embedBlock.helpers({
  enabledState: enabledState,
  inEditedWall: inEditedWall,
  embedCodeWithNoScript: function() {
    if (!this.embedCode) return false;
    if (_.str.include(this.embedCode,'<script')) {
      return 'This embed code contains javascript and has been blocked because some embedded javascript makes the site hang up.  If you are trying to aggregate and poste rss, atom or twitter feeds, use the feed block.';
    } else {
      return this.embedCode;
    }
  }
});

/* to embed javascript ... currently disabled as
some javascript seems to hang the site, even
when loaded after rendering as below
Template.embedBlock.onRendered(function() {
  if (!this.data.embedCode) return;
  if (_.str.include(this.data.embedCode,'<script')) {
    var el = this.firstNode.parentElement;
    //$(el).prepend(this.data.embedCode);
  }
});*/

  /**********************/
 /**** IMAGEBLOCK ******/
/**********************/

Template.imageBlock.helpers({
  imageFile: function() {
    var selector = {blockID:this._id};
    if (!inEditedWall()) //if not editing
      selector.visible = true //show only visible blocks
    return Files.findOne(selector,{sort: {order:1}});
  },
  inEditedWall: inEditedWall,
  enabledState: enabledState,
  processUpload: function() {
    var blockID = this._id
    return {
      finished: function(index, file, tmpl) {
        file.blockID = blockID;
        console.log(file);
        var fileId = Meteor.call('insertFile',file);
      },
      validate: function(files) {
        var valid = true;
        files.forEach(function(file) {
          if ((file.size > 1e8) || (file.type.indexOf('image') < 0))
            valid = false;
        });
        return valid;
      }
    }
  }
});

  /*****************************/
 /**** delete Image File ******/
/*****************************/

Template.deleteImageButton.events({
  'click .deleteImageFile': function(event,tmpl) {
    if (confirm('if this is the last link to this image, \nthe image file itself will also be deleted.  \nAre you sure you want to delete this link?'))
      Meteor.call('deleteFile', this._id);
  }
});

  /**********************/
 /**** FILEBLOCK *******/
/**********************/

/* Make the list sortable??? */
/* to do that, change the organization
instead of an array of fileIds in the block,
have a blockID and order field with each file
then use sortable1c with the list of files
no need for add file and remove file methods in collections/blocks.js,
but files will need an add and remove operation that adjusts the list
same with images?
*/

Template.fileBlock.helpers({
  inEditedWall: inEditedWall,
  enabledState: enabledState,
  files: function() {
    var selector = {blockID:this._id};
    if (!inEditedWall()) //if not editing
      selector.visible = true //show only visible blocks
    return Files.find(selector,{sort: {order:1}});
  },
  processUpload: function() {
    var blockID = this._id
    return {
      finished: function(index, file, tmpl) {
        file.blockID = blockID;
        var fileId = Meteor.call('insertFile',file);
      },
      validate: validateFiles
    }
  },
  sortableOpts: function() {
    return {
      draggable:'.file',
      handle: '.moveFile',
      collection: 'Files',
      selectField: 'blockID',
      selectValue: this._id
    }
  }
});

  /**********************/
 /**** FILELINK  *******/
/**********************/

Template.fileLink.helpers({
  inEditedWall: inEditedWall
});

Template.fileLink.events({
  'click .deleteFile':function(event,template) {
    if (confirm('If this is the last link to this file, \nthe file itself will also be deleted.  \nAre you sure you want to delete this link?')) {
      Meteor.call('deleteFile', this._id);
    }
  }
})
