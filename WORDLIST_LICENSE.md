# Fuentes del diccionario español

El archivo `dictionary-es.js` contiene una transformación para Wordle de dos
recursos lingüísticos públicos:

- Lista amplia de palabras de `xavier-hernandez/spanish-wordlist`, basada en
  `sbosio/rla-es` y distribuida bajo GNU GPL v3:
  https://github.com/xavier-hernandez/spanish-wordlist
- Orden de palabras frecuentes en español obtenido de las listas de frecuencia
  de Wiktionary:
  https://gist.github.com/epidemian/ebb3025e8cb25f6f4e3a

La transformación conserva únicamente palabras de 4 a 8 letras, convierte las
letras a mayúsculas, elimina las tildes y conserva la Ñ. Las palabras frecuentes
que también aparecen en el diccionario amplio pueden ser soluciones; el resto
se utiliza únicamente para validar intentos.

Consulta la licencia completa de la fuente principal en:
https://github.com/xavier-hernandez/spanish-wordlist/blob/main/LICENSE

## Fuentes del diccionario inglés

El archivo `dictionary-en.js` combina:

- La lista alfabética amplia de `dwyl/english-words`, publicada bajo Unlicense:
  https://github.com/dwyl/english-words
- La lista de frecuencia sin palabras ofensivas de
  `first20hours/google-10000-english`:
  https://github.com/first20hours/google-10000-english

Al igual que en español, las palabras comunes que aparecen en ambas fuentes
pueden ser soluciones y el repertorio amplio se utiliza para validar intentos.
