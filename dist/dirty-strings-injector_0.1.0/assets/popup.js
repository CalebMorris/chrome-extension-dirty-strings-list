/* global $ */

function copyTextToClipboard(text) {
  function loadTextOnCopyEvent(e) {
    e.clipboardData.setData('text/plain', text);
    e.preventDefault();
  }
  document.addEventListener('copy', loadTextOnCopyEvent);
  document.execCommand('copy');
  document.removeEventListener('copy', loadTextOnCopyEvent);
}

// TODO: iteration-id
// TODO button click listener
var copyToClipboardButton = '<button>Copy</button>'

function htmlEncode(value){
  return $('<div/>').text(value).html();
}

function htmlDecode(value){
  return $('<div/>').html(value).text();
}

var backSlashEcoding = '&#92;'; // '\'

var namedNonVisibleCharacters = {
  '\b': backSlashEcoding + 'b', // Backspace
  '\f': backSlashEcoding + 'f', // Line Feed
  '\n': backSlashEcoding + 'n', // Newline
  '\t': backSlashEcoding + 't', // Tab
  '\r': backSlashEcoding + 'r', // Carriage Return
  '\0': backSlashEcoding + '0', // null character

  // \u Unicode
  // \x Hex
};

function encodeUnicodeCharacterForDisplay(characterToEncode) {
  var characterHexCode = characterToEncode.charCodeAt(0).toString(16);
  return backSlashEcoding + 'u' + ('0000' + characterHexCode).substr(-4,4);
}

// TODO: fix unicode encoding for command character
// TODO: check against \u encoding
// TODO: check against \x encoding
function unicodeDisplayEncode(stringToEncode){
  if (typeof stringToEncode !== 'string') return stringToEncode;
  var encodedString = "";
  for(var char of stringToEncode) {
    if (char in namedNonVisibleCharacters) {
      encodedString += namedNonVisibleCharacters[char];
    } else if (/[\u0000-\u001f]/.test(char)) {
      encodedString += encodeUnicodeCharacterForDisplay(char);
    } else {
      encodedString += char;
    }
  }
  return encodedString;
}

// TODO: style to have many clear rows
function createDirtyStringRow(item, index, id) {
  return '' +
  '<div class="item row" id="' + id + '">' +
    '<button class="dirty-text-button">' +
      'Copy' +
    '</button>' +

    '<div class="dirty-text-text">' +
      unicodeDisplayEncode(htmlEncode(item)) +
    '</div>' +

    '<div class="dirty-row-count">'+
      index
    '</div>'+
  '</div>';
}

function buildStringSelectionList(stringList) {
  $('#dirty-string-list').empty();
  stringList.forEach(function(item, index) {
    var rowId = 'item-' + index;
    $('#dirty-string-list').append(createDirtyStringRow(item, index, rowId));
    $('#' + rowId).children('button').click(function() {
      console.log('item[' + index + ']:`' + stringList[index] + '`');
      copyTextToClipboard(stringList[index]);
    })
  });
  $('#dirty-string-list').removeClass('hidden');
  $('#loading-icon').addClass('hidden');
}

function displayErrorMessage(message) {
  if (typeof message !== 'string') {
    console.error('Unexpected error message display: ', typeof message);
    return;
  }
  $('#error-message').text(message);
  $('.container').addClass('hidden');
  $('#error-container').removeClass('hidden');
}

function hideErrorMessage() {
  $('#error-container').addClass('hidden');
  $('.container').removeClass('hidden');
  $('#error-message').text('');
}

function loadDirtyStringsFromFile() {
  console.info('loading strings file', chrome.extension.getURL('./lib/blns.json'));
  var jqxhr = $.get(chrome.extension.getURL('./lib/blns.json'))
  .done(function(data) {
    console.log('loaded data', typeof data);
    var stringList = JSON.parse(data);
    buildStringSelectionList(stringList);
  })
  .fail(function() {
    displayErrorMessage('Failed to load dirty strings file');
  });
}

function main() {
  $(document).ready(function() {
    loadDirtyStringsFromFile();
  });
}

main();
