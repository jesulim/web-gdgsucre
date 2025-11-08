type Fn = (x: string | number) => string
const id: Fn = x => String(x)

export const isColorSupported = false
export const reset = id,
  bold = id,
  dim = id,
  italic = id,
  underline = id,
  inverse = id,
  hidden = id,
  strikethrough = id
export const black = id,
  red = id,
  green = id,
  yellow = id,
  blue = id,
  magenta = id,
  cyan = id,
  white = id,
  gray = id
export const bgBlack = id,
  bgRed = id,
  bgGreen = id,
  bgYellow = id,
  bgBlue = id,
  bgMagenta = id,
  bgCyan = id,
  bgWhite = id

const pc = {
  isColorSupported,
  reset,
  bold,
  dim,
  italic,
  underline,
  inverse,
  hidden,
  strikethrough,
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
  gray,
  bgBlack,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,
}
export default pc
