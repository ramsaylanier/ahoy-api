const presets = [
  [
    '@babel/preset-env',
    {
      targets: {
        node: 'current'
      }
    }
  ]
]
const plugins = [
  'babel-plugin-import-graphql',
  '@babel/plugin-proposal-class-properties'
]

module.exports = { presets, plugins }
