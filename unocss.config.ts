import { defineConfig, presetUno, presetIcons, presetTypography } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetTypography({
      cssExtend: {
        '*': {
          'margin-top': '0em',
        },
        '*:first-child': {
          "margin-top": '0em'
        },
      }
    }),
    presetIcons()
  ]
})