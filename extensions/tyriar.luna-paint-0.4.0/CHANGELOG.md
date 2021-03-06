# v0.4.0 - 5 April 2021

### Features

**Readonly .ico file support**

Opening .ico files is now supported, when opened the _Layers_ window is replaced with an _Images_ window which shows all images contained within the file, including details on their size and format.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.4/ico-support.png)

Saving and editing is coming soon, the focus this version was on writing the parser and making the systems around it solid, instead of rushing the editing and saving experience. Editing .ico files will also require some reworking of the backend to support manipulating multiple images within a single file.

Reading of the majority of icons should work, the following uncommon image types are known to _not_ be supported yet:

- Icons with entries using BMP compression.
- 2 and 16-bit icons

If you have an .ico file that Luna Paint cannot read and are able to share it, please [create an issue](https://github.com/lunapaint/vscode-luna-paint/issues/new) with it attached.

**.bmp File Support**

Bitmap files (.bmp) can now be opened and saved.

**Fill Tolerance** ([#29](https://github.com/lunapaint/vscode-luna-paint/issues/29))

A new fill tolerance option is being introduced which defines how similar a pixel's color needs to be to the pixel clicked.

**Improved keyboard accessibility**

The Layers, Images, History and Tools windows are now keyboard accessible, escape can be used to focus the canvas.

**Number inputs shortcuts**

All number inputs now have the following shortcuts:

- <kbd>up</kbd>: Increment by 1
- <kbd>down</kbd>: Decrement by 1
- <kbd>ctrl</kbd>/<kbd>cmd</kbd>+<kbd>up</kbd>: Increment by 10
- <kbd>ctrl</kbd>/<kbd>cmd</kbd>+<kbd>down</kbd>: Decrement by 10
- <kbd>ctrl</kbd>/<kbd>cmd</kbd>+<kbd>left</kbd>: Set to minimum (if one exists)
- <kbd>ctrl</kbd>/<kbd>cmd</kbd>+<kbd>right</kbd>: Set the maximum value (if one exists)

These shortcuts also work in the palette's hex input but increments by 16 (`0x10`) instead, the color channel that is affected is based on where the cursor/selection is.

**Other**

- Add hover feedback for minimap viewport.
- The minimap now works for any image size. This may cause some dropped frames after performing edits, but for typical images sizes it's barely noticeable and not worth losing the minimap. The minimap can always be hidden which will stop this slow down. It's still the plan to [move this into a worker when available](https://github.com/microsoft/vscode/issues/87282).
- Added a Crop to Selection button to the toolbar for the Selection and Move Selection tools.
- Created a basic interface overview for Luna Paint for VS Code's [upcoming Getting Started feature](https://github.com/microsoft/vscode/issues/106717).
- Opening an empty file with an image extension will treat it as an image with the default dimensions defined in `luna.defaultImageSize` ([#34](https://github.com/lunapaint/vscode-luna-paint/issues/34)).

### Bug Fixes

- Align list style with VS Code's style and adapt to the theme.
- Fix history entry name after creating a new image.
- Fixed an exception that could occur when running Crop to Selection and other layer/image tasks.
- Keybindings
  - Adopted [the new](https://github.com/microsoft/vscode/issues/113511) `activeCustomEditorId` context ID for keybindings which simplifies keybindings and should make then a little more reliable.
  - Fix keybindings overriding command palette's if triggering immediately after opening an image via the explorer ([#21](https://github.com/lunapaint/vscode-luna-paint/issues/21)).
- Layers Window
  - Increase mouse target for switching layers.
- Minimap Window
  - Move pixel updates are now reflected immediately in the minimap.
  - Prevented unnecessary minimap updates when moving the viewport.
- Palette Window
  - Improve handling of the empty string in channel inputs.
  - Prevent validation of channel inputs until focus is lost.
  - Fix the slider tab going out of bounds.
  - Copy, cut, paste and select all should now work in text fields.
- Tools
  - Cmd+arrow now shifts rectangle or selection by 10 pixels on macOS (previously ctrl).
- Move Pixels
  - Fix history entries not showing up when moving with the keyboard.
- Saving/loading
  - Saving an unmodified image will no longer attempt to save (save as can still be used).
  - Fixed auto save not correctly saving in progress Move Pixel actions.
  - Fix issue where file changes would not be picked up when a file was changed outside VS Code shortly after saving the file.
  - Reverting and reloading the file will now reload the file without closing and reopening the webview which caused a flicker.
  - Correctly finish objects before saving when auto save is off ([#33](https://github.com/lunapaint/vscode-luna-paint/issues/33)).
  - Auto save will now apply in progress rectangles and moving pixels.

# v0.3.0 - 2 March 2021

### Features

**Scale Pixels** ([#26](https://github.com/lunapaint/vscode-luna-paint/issues/26))

The Move Pixels tool now has handles that can scale the selected pixels.

- Like regular resize, nearest neighbor and bilinear interpolation is available.
- Resampling is performed when on the pointer up event so the framerate while resizing is smooth.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.3/scale-pixels.png)

**Expand Canvas to Selection**

There is a new command that can be run to expand the canvas to include the selection.

- The button is available in the Move Pixels tool's top bar or through the command palette.
- This is useful immediately after pasting to fit the pasted image into the canvas, as well as conveniently resizing while moving any selection.
- Canvas resizing can happen in any direction.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.3/expand-canvas-to-selection.png)

**Other**

- It's now a little easier to avoid an accidental selection when deselecting by clicking with the selection tool.

### Bug Fixes

- Improved icon fidelity when monitor scaling is between 100% and 200%.
- Allow copying from the text fields (palette, options), copying when there is no selection will copy all text.
- Improved rotate history entry labels.
- Disambiguate history entries that can run on a single layer and all layers.
- Pencil tool
  - Fix pencil outline incorrectly showing up above and below bounds of image.
  - Ensure the pencil angle hover doesn't display when switching to pencil tool.
  - Show the shift line guide only when it's relevant.
- Eraser tool
  - Fix clearing pixels across the image's horizontal boundary.
- Move Selection tool
  - The tool is reactivated when undoing or redoing into a "Move Selection" history entry.
- Move Pixels tool
  - Show the handles immediately after Select All.
- Resize: Bilinear interpolation
  - Improved bilinear resize quality when downsampling.
  - Fix blending with fully transparent pixels.
- Codespaces on Firefox fixes
  - Fix image loading and saving.
  - Fix layer preview not working.
  - Fix mouse wheel scrolling too slowly.
  - Fix red outline around hex text box.
- Minimap window
  - Redraw the minimap when all layers are hidden.
  - Remove stale minimap image when resizing to dimensions that exceed the maximum supported.
  - Allow mouse input when dimensions the exceed maximum supported.

# v0.2.0 - 1 February 2021

### Features

**Rectangle Tool** ([#13](https://github.com/lunapaint/vscode-luna-paint/issues/13))

A new rectangle tool has been added, here are some of the features it supports:

- Options include blend mode, style (fill, outline or both), outline size.
- All options can be independently configured, even after drawing the initial rectangle.
- Hold <kbd>shift</kbd> to draw a square.
- Handles like move selection that enable resizing in all directions and moving the rectangle.
- Detailed history of each change that occurred to the rectangle.
- The editor's bottom bar shows rectangle's top left coordinates and dimensions.
- Drawing scales well to huge images, keeping ~60 fps on 100MP+ images (may vary depending on CPU/GPU).

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.2/rectangle.png)

**Minimap**

The preview window has been renamed to the minimap, it now also allows navigation around the image and is now shown by default.

- Move the viewport by clicking and dragging within the minimap.
- The mouse wheel zooms the viewport in and out.
- The minimap can be toggled between the default "stretch mode" and a 100% zoom mode, this is useful for previewing small images at their actual size.
- The viewport rectangle can also be toggled.
- Images up to 5MP are now supported (up from 1MP), this limitation is required until [webview web worker support lands in VS Code](https://github.com/microsoft/vscode/issues/87282) to ensure the canvas remains responsive.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.2/minimap.png)

**Pixel Grid** ([#5](https://github.com/lunapaint/vscode-luna-paint/issues/5))

A pixel grid is enabled by default that shows up at >= 400% zoom, this can be toggled on and off with the grid button in the top right.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.2/pixel-grid.png)

**Cursor Coordinates** ([#6](https://github.com/lunapaint/vscode-luna-paint/issues/6))

The mouse's current coordinates within the image are not displayed in the editor's bottom bar, next to the image dimensions.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.2/cursor-coords.png)

**Sliders and Hex in the Palette** ([#7](https://github.com/lunapaint/vscode-luna-paint/issues/7), [#17](https://github.com/lunapaint/vscode-luna-paint/issues/17))

The Palette window now features sliders as well as an input box for primary color's hex value.

- The sliders may be adjusted via click+drag or changed by +1/-1 by using the mouse wheel while hovering the slider.
- Inputing hex in `rgb` notation will automatically expand to `rrggbb`.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.2/palette.png)

**Improved Pencil Line Preview**

A regular line (as opposed to the pixel outline) is now shown when using shift and zoomed out beyond 400%.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.2/pencil-preview.png)

**Other**

- <kbd>Enter</kbd> now finishes the "active action". For example on the Move Pixels tool this will commit pixels being moved by replacing those underneath, for the rectangle tool this will draw the rectangle to the layer. This keybinding can be customized with the `luna.image.finishActiveAction` command.
- The `luna.file.new` command accepts width and height arguments ([#2](https://github.com/lunapaint/vscode-luna-paint/issues/2)). This can enable a quick way to import screenshots using a keybinding like:
   ```json
   {
     "key": "ctrl+'",
     "command": "luna.file.new",
     "args": { "width": 1920, "height": 1080 }
   }
   ```
- The `luna.view.fitToWindow` command (<kbd>ctrl</kbd>/<kbd>cmd</kbd>+<kbd>b</kbd> by default) will now lock scrolling via the edges or the screen until the mouse wheel is used ([#14](https://github.com/lunapaint/vscode-luna-paint/issues/14)).
- Tools with number options (eraser brush size, rectangle outline size) now use number inputs instead of dropdowns with few options.
- The fill, pencil, eraser, color picker and rectangle tools have matching cursors that show the active tool at the mouse position.

### Behavior Changes

- Changed the keybindings for zooming to avoid overriding <kbd>ctrl</kbd>/<kbd>cmd+b</kbd> as toggling the sidebar is useful to give more image editing space:
  - `luna.view.actualSize` is now <kbd>ctrl</kbd>/<kbd>cmd</kbd>+<kbd>9</kbd> (previously <kbd>ctrl</kbd>/<kbd>cmd</kbd>+<kbd>0</kbd>).
  - `luna.view.fitToWindow` is now <kbd>ctrl</kbd>/<kbd>cmd</kbd>+<kbd>0</kbd> (previously <kbd>ctrl</kbd>/<kbd>cmd</kbd>+<kbd>b</kbd>).

### Documentation

- Filled in the eraser section of the extension readme ([#8](https://github.com/lunapaint/vscode-luna-paint/issues/8)).

### Bug Fixes

- Fix an issue where opening a file more than one time could corrupt the history stack.
- Removed "The image was deleted on disk." notification when deleting the active image ([#18](https://github.com/lunapaint/vscode-luna-paint/issues/18)).
- Fix arrows to move selection after selecting the Move Selection tool via the tools window specifically.
- Improved where pasted images are put after copying a part of the image.
- Window state (tools, history, etc.) is now rememebered for modified images when restoring the webview context.
- The `Adjustments > Invert` command will now only apply to the current layer, not all layers.
- The editor no longer unexpectedly reloads or finishes a selection when auto save is enabled.
- Selection
  - Make erase selection also clear the selection ([#9](https://github.com/lunapaint/vscode-luna-paint/issues/9)).
  - Fix erase selection properly erasing while moving pixels ([#10](https://github.com/lunapaint/vscode-luna-paint/issues/10)).
  - Rerender selection when zooming or scrolling while another application is focused.
- Pencil
  - Fix shift+click double drawing at click points when using transparent color ([#11](https://github.com/lunapaint/vscode-luna-paint/issues/11)).
  - Show the shift+drag outline when either the start point or the cursor is outside of the image.
- Layers window
  - Added a tooltip and pointer cursor to the layer button ([#15](https://github.com/lunapaint/vscode-luna-paint/issues/15)).

# v0.1.2 - 4 January 2021

- Fix an issue in VS Code stable where a blank screen shows when loading an image ([#1](https://github.com/lunapaint/vscode-luna-paint/issues/1)).

# v0.1.1 - 4 January 2021

- Set `retainContextWhenHidden` to true by default. ([#3](https://github.com/lunapaint/vscode-luna-paint/issues/3)).
- Fix an issue where layers would not get restored when switching back to a non-dirty file with history. ([#4](https://github.com/lunapaint/vscode-luna-paint/issues/4)).

# v0.1.0 - 4 January 2021

- Initial release.
