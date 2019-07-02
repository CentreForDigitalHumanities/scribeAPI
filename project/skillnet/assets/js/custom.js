$(document).ready(function () {
  $(document).on('click', 'div.i18n span.lang', function (event) {
    var newLanguage = $(event.target).text().trim()
    $langStyle.html(showLanguage(newLanguage))
  })
  function showLanguage(language) {
    document.cookie = `language=${language}`
    return $(`<style>.i18n .${language} { display: inherit; }</style>`)
  }
  function determineDefault() {
    var languages = navigator.languages || []
    for (var i in languages) {
      switch (languages[i].replace(/-.*$/, '')) {
        case 'nl':
          return 'language=nederlands'
        case 'en':
          return 'language=english'
      }
    }
    return 'language=english'
  }
  var currentLanguage = document.cookie.split(';').filter(function (item) {
    return item.trim().startsWith('language=')
  })[0] || determineDefault()

  var $langStyle = showLanguage(currentLanguage.split('=')[1])
  $(document.body).append($langStyle)
})
