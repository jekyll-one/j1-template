# ------------------------------------------------------------------------------
# ~/_plugins/asciidoctor-extensions/placeholder-inline.rb
# Asciidoctor extension for placeholder images generated by "placehold.it"
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023 Juergen Adams
#
# J1 Template is licensed under the MIT License.
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
#
# ------------------------------------------------------------------------------
require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'
include Asciidoctor

# A inline macro that places an "placehold.it" URL into the output document
#
# Usage
#
#   placeholder:<name>[<size>, <color>]
#
# Example:
#
#   placeholder:300x600[300x600, 212121]
#
Asciidoctor::Extensions.register do
  class PlaceholderInlineMacro < Extensions::InlineMacroProcessor
    use_dsl
    named :placeholder
    name_positional_attributes 'size', 'modifier'
    default_attrs 'size' => '300x300', 'modifier' => ''

    def process parent, target, attributes

      doc = parent.document
      size_class = (size = attributes['size']) ? %(mdil-#{size}) : nil
      modifier_class = (modifier = attributes['modifier']) ? %(#{modifier}) : nil

      %("http://placehold.it/#{size}/#{modifier}")
    end
  end

  inline_macro PlaceholderInlineMacro
end
