# v0.12.0 - 4 January

### Features

**Colors window**

A new "Colors Window" has been added which contains a large HSV selector:

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.12/colors-window.png)

Details and more sliders can be shown by clicking the `>` button at the top of the window:

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.12/colors-window-expanded.png)

Here are some of the features/changes in the new window:

- Color channels are explained in tooltips when hovered.
- HSV is "supported natively", meaning there should be no loss of precision which could happen when converting between HSV and RGB.
- The `luna.palette.swapColors` command has been changed to `luna.color.swapColors`.

**Slimmed down palette window**

With the introduction of the new Colors Windows, the Palette Window has been slimmed down significantly. It is no longer visible by default but can be toggled by triggering the `Toggle Palette Window` command.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.12/palette-window.png)

**Shape tool: Diamond**

The shape tool can now also draw a diamond:

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.12/diamond-shape.png)

### UX / Polish

- Merge layer down and move layer up/down buttons are now disabled when the action isn't possible.
- Only show commands that require a selection (crop, erase, etc.) from the command palette when there is an active selection.

### Documentation

- New getting started pages:
  - Colors window

### Bug Fixes

- Fixed images not refreshing when a change happened outside the editor ([#105](https://github.com/lunapaint/vscode-luna-paint/issues/105)).
- Fix case where the image could become locked when switching tools and using the new tool quickly, this was typically only reproducible on slower hardware.
- Prevent context menu from showing on right click unless an the target was an input field.
- Fix an issue where complex history entries could be played in reverse order.
- Added a content security policy back for the web extension since an issue was fixed in VS Code core.
- Fixed issue where layer previews would be generated for already deleted layers.
- Prevent commands crop to selection and expand canvas to selection from creating error history entries when run without a selection.
- Fix touch actions not working after a short period ([#112](https://github.com/lunapaint/vscode-luna-paint/issues/112)).
- Line tool
  - Fix move handles showing up before a line is drawn.
- Eraser and color picker tools
  - Fix the pixel outline after zooming the canvas.
- Move selection, move pixels and text tools
  - Fix handles sometimes skipping cells when dragged.
  - The cell underneath the dragged handle will now always be included in the new rectangle.
  - Flipping the range will no longer allow the invalid height or width of 0 pixels.
- Ellipse tool
  - A 1x1 ellipse will now be rendered properly.
  - Fix non-smooth rendering when outline > 1.



# v0.11.0 - 20 November

### Features

**Blend mode support in fill tool**

Full blend mode support now works for the fill tool. With this you can now _replace_ the pixels without blending them for example.

### Engineering

- [esbuild](https://esbuild.github.io/) is now used to improve some bundling.

### Bug Fixes

- Fix creating new images or icons inside windows that don't have a folder opened ([#107](https://github.com/lunapaint/vscode-luna-paint/issues/107)).
- Fix the import from clipboard command failing to read the clipboard.
- Keybindings should now work immediately without clicking on a newly opened image.



# v0.10.0 - 8 September

### Features

**Message on copy**

A message is now shown to confirm when a selection is copied and what the dimensions of copied image are. This makes it more obvious what the dimensions are and also helps confirm that the copy action actually did occur, in case there was some keybinding issue with VS Code.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.10/copy-message.png)

### Engineering

A lot of effort when into building out an integration test suite using [`@playwright/test`](https://playwright.dev/docs/intro/) over the past 2 months which has fixed many minor issues and will boost reliability and prevent future regressions.

### Bug Fixes

- Fix notification wrongly showing up during save on github.dev ([#96](https://github.com/lunapaint/vscode-luna-paint/issues/96)).
- Fixed several race conditions when performing actions quickly after loading an image or using a new tool.
- Fix an issue where the red channel would be cleared when drawing some non-smooth shapes.
- Prevent unchecking shape type and text alignment options.
- Line tool
  - Prevent a brush size of 0 when resizing using the size handle.
  - Don't show angle preview when holding shift and moving a line since it cannot be changed.
  - Update angle in status bar immediately when dragging one of the points.



# v0.9.0 - 26 August

### Features

**github.dev and restored Codespaces support**

GitHub now features a lightweight serverless text editor called [github.dev](https://github.dev/) that compliments the compute-backed [Codespaces](https://github.com/features/codespaces). This release is out a little early to ship support for github.dev and restore Codespaces support which broken recently in new browser versions that restricted the use of `SharedArrayBuffer`.

This means you can edit images in a GitHub repo for free using your browser! Just hit `.` on your repo and enable settings sync to synchronize your extensions.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.9/github-dev.png)

A decent amount of changes were needed to make this support work so as always [let me know if you hit problems](https://github.com/lunapaint/vscode-luna-paint/issues).

**Color at Pointer ([#86](https://github.com/lunapaint/vscode-luna-paint/issues/86))**

There is a new status bar item that will show the color under the cursor position, it updates when paused briefly on a pixel to reduce visual noise.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.9/pointer-color.png)

Clicking on the status bar item will toggle between sampling the current layer of all layers, behind the scenes this will toggle the new `luna.statusBar.pointerColor` setting.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.9/layer-or-image.png)

**Auto save warning**

There is a new warning that appears in the status bar when auto save is using the `afterDelay` mode as this can cause frames to drop while drawing, leading to jagged lines.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.9/auto-save-warning.png)

While it uses the warning color to grab your attention, it was a priority to make this as unobtrusive as possible. You can left click on the item to dismiss it for this session or right click to hide it permanently.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.9/auto-save-warning-dismiss.png)

**Other enhancements**

- When pasting an image, if the selection dimensions match the pasted image's dimensions it will now be placed where the selection was.
- The primary and secondary colors are now synced across all image documents ([#82](https://github.com/lunapaint/vscode-luna-paint/issues/82)).

### Performance Improvements

- Reduce amount of memory used when drawing rectangles.

### Documentation

- Several grammar improvements [#88](https://github.com/lunapaint/vscode-luna-paint/issues/88).

### Bug Fixes

- Fix line and shape tools not saving most recent history entry on hot exit.
- Fix layer actions like Invert and Rotate correctly applying to a selection that's being moved.
- The triangle shape is now correctly mirrored when flipped on its y axis.
- Errors when loading images such as being unable to decode the image are now surfaced in the canvas.
- Retain the selection after Layer > Invert is called.
- Ensure minimap viewport cannot go outside of the minimap window.
- Fix move pixels finish result when the x axis is flipped



# v0.8.1 - 3 August

### Bug Fixes

- Fix hot exit not working.
- Fix case where image could be zoomed out all the way when opening.



# v0.8.0 - 2 August

### Features

**Text tool ([#48](https://github.com/lunapaint/vscode-luna-paint/issues/48))**

A new text tool has been added, allowing flexible drawing of text with the following features:

- Options: font family, size, weight, italics, vertical and horizontal alignment, blend mode.
- Shift aspect lock support.
- Alt mirroring support.
- Arrow move support.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.8/text-tool.png)

**Shape tool: Right-angle triangle**

The shape tool can now also draw a right-angle triangle:

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.8/right-angle-triangle.png)

**Other enhancements**

- The outline color now uses the focus color, this should provide good contrast in most situations. When it doesn't, the theme can be changed for better contrast.
- New command: `luna.selection.eraseKeepSelection` allows erasing the selection without deselecting.

### Performance Improvements

- Significantly reduced memory and cpu usage when drawing shapes.

### Documentation

- New getting started pages
  - Text tool

### Bug Fixes

- Fix blurriness on high dpi displays ([#32](https://github.com/lunapaint/vscode-luna-paint/issues/32)).
- Fix rasterization of triangles where the x axis is flipped.
- Images imported from the clipboard that have hot exit disabled will now store the clipboard data at that time so it will restore to the initial state when `luna.retainContextWhenHidden` is false.
- Improve status bar overflow behavior, all items should now be accessible in narrow windows.
- Shape layers will now respect the selection when restored by hot exit.
- When import from clipboard is run when only non-image data is in the clipboard will now fallback to a new image with default dimensions.
- Improve 1px outlines when drawing shapes with the "Fill and outline" style.
- Round non-snapped info when drawing a shape to 2 decimal places.
- Palette color state is now restored for all tools on hot exit.



# v0.7.1 - 5 July

### Bug Fixes

- Reverted "Improve trackpad handling on non-macOS and mouse support on macOS ([#75](https://github.com/lunapaint/vscode-luna-paint/issues/75))" as it didn't handle some trackpad cases correctly.



# v0.7.0 - 2 July

### Features

**Shape tool**

A new shape tool has been added that currently supports drawing an ellipse and triangle.

- This shape tool is modeled after the existing rectangle tool.
- Smoothing/anti-aliasing is supported by default.
- The shape outline show the exact outer edge of the shape to be rasterized.
- Resizing the shape to flip the axes is supported.
- Holding alt while drawing a shape will use the point not being dragged as the center point.
- The shape can be moved with the arrow keys.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.7/shape-tool.png)

When using non-smooth and 1px outline size options the shape tool uses a special mode that draws pixel-perfect lines:

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.7/shape-pixel-perfect.png)

**Line tool improvements**

The line tool has received a lot of work this month:

- Instead of rasterizing the pixels when drawn it now creates an interactive line object that can be manipulates just like the rectangle tool. This includes handles for both moving the points or resizing the width of the line.
- The line now draws smooth/anti-aliased lines by default, this can be disabled using the smoothing option in the top bar.
- Brush size is now supported.
- A new guide is used for all lines except non-smooth 1px wide lines which shows where the smooth rectangle will be drawn.
- Holding alt while drawing a line will use the point not being dragged as the center point instead of the other end of the line.
- The line can be moved with the arrow keys.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.7/line-improvements.png)

There is also detailed information about the line available in the bottom bar:

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.7/line-info.png)

**Alt+drag support for the rectangle tool**

Along with line and shape, the rectangle now also supports alt+drag to mirror resize changes on the other side.

**Object handle and outline improvements**

Outlines now show all the time while the object is active, not just when being moved or resized. They are also now more narrow and are colored dynamically based on the backing color.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.7/guide.png)

Object handles also received a redesign, using the theme color + white instead of the black/white circle outlines.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.7/handles.png)

**Snap to pixel grid**

The new `luna.snapToPixelGrid` can be disabled which allows drawing lines and shapes not locked to the pixel grid:

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.7/snap-to-pixel-grid.png)

**Entry in the welcome page New File... button ([#81](https://github.com/lunapaint/vscode-luna-paint/issues/81))**

Luna Paint now supports the upcoming VS Code feature on the welcome page to allow create a new image or icon file from the welcome page:

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.7/welcome.png)

**Other enhancements**

- The rectangle tool now supports the `replace` blend mode.
- Adopted [status bar id/name](https://code.visualstudio.com/updates/v1_57#_status-bar-item-id-and-name-properties) to improve the description when right clicking on the status bar entry.
- Tools are now separated by their category in the tools view.

### Performance Improvements

**Greatly improved load and save time**

Thanks to a change in VS Code to improve the typed array extension host to/from webview transfer time [landing in v1.57.0](https://code.visualstudio.com/updates/v1_57#_improved-webview-array-buffer-transfers), Luna Paint's image load and save time has been greatly improved. The improvements get more impressive as the images get larger. The below numbers were taken using the average of 2 instances of each action.

Loading:

| Image Size | Before (ms) | After (ms) | Change
|---|---|---|---
| 1000x1000 (28kb) | 35.48 | 16.11 | **-55%**
| 10000x10000 (18.3mb) | 8074.27 | 679.34 | **-92%**

Saving:

| Image Size | Before (ms) | After (ms) | Change
|---|---|---|---
| 1000x1000 (28kb) | 9.52 | 4.82 | **-49%**
| 10000x10000 (18.3mb) | 4585.34 | 348.46 | **-92%**

**Other improvements**

- Framerate should improve when the pixel line guide is displayed on a large monitor.

### Documentation

- New getting started pages
  - Shape tool
- Updated getting started pages
  - Line tool

### Bug Fixes

- When actions cause errors like when cropping the image to its full dimensions, the editor's history will no longer be corrupted ([#79](https://github.com/lunapaint/vscode-luna-paint/issues/79)).
- Show an error in the canvas when the browser doesn't support `SharedArrayBuffer`, instead of breaking some functionality.
- Fix the viewport breaking when alt+clicking an empty layer.
- Don't hide tool option inputs when the window is narrow.
- Flatten layers will no longer consider deleted layers.
- Update tool cursor immediately after an undo or redo.
- Updating tool options or the palette with the arrow keys no longer move active shapes.
- Improve trackpad handling on non-macOS and mouse support on macOS ([#75](https://github.com/lunapaint/vscode-luna-paint/issues/75)).
- Hand tool
  - Holding space will no longer switch to the original tool and back to the hand when the pointer is released.
  - Ensure using space with the hand tool will not trigger actions in the original tool ([#77](https://github.com/lunapaint/vscode-luna-paint/issues/77), [#78](https://github.com/lunapaint/vscode-luna-paint/issues/78)).
- Move pixels tool
  - Flipping the selection will no longer incorrectly restore it back to the original when moving multiple times.
  - Fix an exception that could throw when undoing move pixel steps.
  - Restore correct smoothing quality on moved pixels after hot exit.
  - Fix redo history sometimes not applying the properly scaled image.
  - Fix axis flipping when dragging back and forth.
  - Correct cursor state when dragging immediately after flipping the selection.
- Move selection tool
  - Fix an exception when redoing a history entry after deleting a selection outside the bounds of the canvas.
- Line
  - Add accidental click protection.
  - Hide line angle info when the pointer is released.
- Rectangle
  - Prevent rectangle from moving when changing outline size via up/down.
  - Prevent case where a finished rectangle could be edited after hot exit, corrupting history.
  - Restore in-progress rectangle handles after hot exit.
  - When drawing a rectangle, the cursor will now be updated when the pointer is released so it can be adjusted without moving the pointer again.
  - Add accidental click protection.
  - Fix display of handles when clicking after undo.
  - Restore display of handles after hot exit.
  - Update rectangle dimensions in status bar after undo/redo.
- Zoom tool
  - Prevent zooming on a rectangle going beyond the maximum of 10000% ([#76](https://github.com/lunapaint/vscode-luna-paint/issues/76))).
- Minimap
  - Fix deleted layers showing up in the minimap.
  - Fix transparent pixels rendered incorrectly on bottom layer



# v0.6.0 - 7 June 2021

Special call out to [@duianto](https://github.com/duianto) who reported a lot of issues/feature requests since 0.5 went out, thanks for making this a more solid release!

### Features

**Webp support and save quality for jpeg**

The .webp image format is now supported, it and jpeg now have a quality picker when saving the image.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.6/save-quality.png)

Note that for lossy formats the original image will remain open and not be reloaded upon saving, this is particularly important when using auto save so the image doesn't continue to get recompressed each save.

**Hand tool** ([#55](https://github.com/lunapaint/vscode-luna-paint/issues/55))

The new Hand tool allows panning the image with left click. The shortcut for the tool is <kbd>H</kbd> and it can be temporarily switched to by holding <kbd>space</kbd>.

**Duplicate layers and images**

Layers and images (in .ico files) can now easily be duplicated via the right click context menu or through the button in the Layers or Images windows:

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.6/duplicate-layers.png)

**Flexible windows**

Windows in the UI can now be dragged around the UI, they will snap to the editor's edges and relayout when the webview is resized. This window state is remembered for the lifetime of the editor and across hot exit/reload.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.6/flexible-windows.png)

**Fit layer to window**

The new `luna.view.fitLayerToWindow` command will zoom into a layer's non-transparent content. This command is available through the command palette, the layers context menu and by <kbd>alt</kbd>+clicking the layer in the Layers window.

**Shift to lock aspect ratio**

The Move Selection, Move Pixels and Rectangle tools now support aspect ratio locking when resizing while shift is held.

**Other enhancements**

- Added support for drag and drop within the images and layers views.
- The zoom tool supports zooming into an area by clicking and dragging.
- There's a new report issue/feedback button in the top right, backed by the `luna.help.reportIssue` command.
- New setting `luna.mouseWheelBehavior` allows flipping the ctrl/cmd+wheel behavior so you can zoom without holding a modifier.
- Lesser used .jpe (jpeg), .jiff (jpeg) and .dib (bmp) file extensions are now supported.
- The move pixels tool now allows flipping the selection horizontally/vertically.
- Added a readonly mode that prevents edits on "readonly file systems", such as when opening files via the scm/git sidebar ([#19](https://github.com/lunapaint/vscode-luna-paint/issues/19)).
- The Layers and Images windows now have a context menu.
- Layers can now be renamed, note that this is not currently persisted with the file so will only last for the current session.

### Behavior Changes

- The default colors have been swapped so black is now the primary and white is the secondary ([#53](https://github.com/lunapaint/vscode-luna-paint/issues/53)). This makes more sense since the default background color of new images is white.
- When merging a layer into a non-visible layer it will now be shown. The correct behavior here is arguable but it felt like a bug that this wasn't happening, especially when the top layer was visible.
- Any resize to an image, including undo/redo will now fit the image to the window ([#70](https://github.com/lunapaint/vscode-luna-paint/issues/70)). This may get refined more later perhaps even with the possibility of integrating with [the standard go forward/back commands](https://github.com/microsoft/vscode/issues/124388) but for now this feels much better, especially when using the cropping tool.

### Performance Improvements

- Reduced the amount of data uploaded to GPU on some frames.

### Documentation

- New getting started pages
  - Color picker tool
  - Rectangle tool
  - Viewport tools

### Bug Fixes

- Reuse new untitled image IDs when editors are saved or closed ([#51](https://github.com/lunapaint/vscode-luna-paint/issues/51)).
- Fix untrusted workspace support by using the new `capabilities` key.
- Fix primary and secondary color swatches sometimes having a white outline when `window.zoomLevel` is not `1` ([#49](https://github.com/lunapaint/vscode-luna-paint/issues/49)).
- Improve styling of top/bottom bar toggle items.
- Layers
  - Reuse the layer ID in its name when layers are deleted ([#51](https://github.com/lunapaint/vscode-luna-paint/issues/51)).
  - Fixed the layer's window visibility and blend mode not updating on undo/redo ([#60](https://github.com/lunapaint/vscode-luna-paint/issues/60)).
  - Fixed active layer sometimes not getting set when deleting layers ([#67](https://github.com/lunapaint/vscode-luna-paint/issues/67)).
  - Fix merging down not retaining bottom layer's data if it was not visible at the time of merging.
- Hot exit/restore
  - Fixed some cases where window state (eg. layers, palette, etc.) would not be restored by hot exit.
  - Window state is now restored after a hot exit reload.
  - Fix exception that would throw when the Reopen Closed Editor command is run after closing an untitled image.
- Tools
  - Dragging tools (selection, rectangle, line, etc.) to the edge of the viewport will now update the preview live instead of on the next mouse move event.
- Rectangle tool
  - Fixed history corruption when deleting or creating layers before finishing a rectangle ([#64](https://github.com/lunapaint/vscode-luna-paint/issues/64)).
- Selection tool
  - Fixed undoing move selection entries triggering select all.
- Move pixels tool
  - When switching to the Move Pixels tool while the selection is out of the viewport, the expand canvas to selection button will be correctly enabled.
- Rendering
  - Fixed layers sometimes having their render tiles stretched, distorting the image ([#65](https://github.com/lunapaint/vscode-luna-paint/issues/65)).
  - Fixed stale render tiles sticking around sometimes when reducing the size of an image ([#57](https://github.com/lunapaint/vscode-luna-paint/issues/57)).
- .ico files
  - Be more lenient for .ico files that state invalid icon entry values such that they still load and attempt to extract the images. Information on file corruption like this will be written to the VS Code's console. Big thanks to [@fourbadcats](https://twitter.com/fourbadcats) for providing an example file for this.
  - Allow icons containing corrupt images that fail to load to continue on, corrupt images will still be shown in the images window as "1x1 - corrupt".
  - Improved diagnostics for problems that occur during .ico parsing.



# v0.5.1 - 8 May 2021

### Bug Fixes

- Ensure the layers window updates when moving layers ([#50](https://github.com/lunapaint/vscode-luna-paint/issues/50))
- Fix images view showing up for new non-ico files ([#52](https://github.com/lunapaint/vscode-luna-paint/issues/52))



# v0.5.0 - 3 May 2021

### Features

**Ico support** ([#30](https://github.com/lunapaint/vscode-luna-paint/issues/30))

Readonly .ico file support was added in v0.4.0, this release adds full editing support!

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.5/ico-support.png)

With this feature comes the first experience for editing multiple images within a single file. It works much like the existing layers window, just that activating an image will open that image instead of swapping layers. History is shared across all images in the file.

The following bits per pixel are supported:

- 1 (2 colors)
- 4 (16 colors)
- 8 (256 colors)
- 24 (true color)
- 32 (true color + alpha channel)

The following new commands were added to support icons and multi-image file editing:

- `luna.file.newIcon`
- `luna.image.addNewImage`
- `luna.image.deleteImage`
- `luna.image.goToTopImage`
- `luna.image.goToImageAbove`
- `luna.image.goToImageBelow`
- `luna.image.goToBottomImage`
- `luna.image.moveImageToTop`
- `luna.image.moveImageUp`
- `luna.image.moveImageDown`
- `luna.image.moveImageToBottom`

The only caveat here is that currently restricted palette editing is not implemented ([#47](https://github.com/lunapaint/vscode-luna-paint/issues/47)). So if you're editing a low bits per pixel icon and either use too many colors or use the alpha channel, the icon will automatically increase its bits per pixel on save to ensure all colors are retained.

**Line Tool** ([#12](https://github.com/lunapaint/vscode-luna-paint/issues/12))

A new line tool (<kbd>O</kbd>) has been added which enables drawing straight lines, left click will use the primary color and right click will use the secondary color.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.5/line-tool.png)

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.5/line-tool-usage.png)

Holding shift while the line tool is active will restrict the line's angle to the nearest 15°.

**Crop Tool** ([#41](https://github.com/lunapaint/vscode-luna-paint/issues/41))

A new Crop tool (<kbd>C</kbd>) has been added which acts similarly to the selection tool, but it will crop as soon as the selection is made.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.5/crop-tool.png)

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.5/crop-tool-usage.png)

This is an alternative to the existing crop methods:

- The button in the top bar when the selection and move selection tools are active.
- The command with the default keybinding <kbd>ctrl/cmd+shift+x</kbd>.

**Getting Started Integration**

VS Code has an upcoming "Getting Started" feature which lets extensions integrate into a shared welcome experience. Adoption of this has started in Luna Paint, you can check it out by enabling `"workbench.welcomePage.experimental.extensionContributions": true` in your settings and then opening the getting started page from the Help menu. Note that this is an experimental feature in VS Code and subject to change.

![](https://raw.githubusercontent.com/lunapaint/vscode-luna-paint/master/images/changelog/0.5/getting-started.png)

**Import Image from Clipboard** ([#40](https://github.com/lunapaint/vscode-luna-paint/issues/40))

A new `luna.file.importFromClipboard` command has been added which will create a new image based on the image in the clipboard. When there is no image in the clipboard or the clipboard cannot be accessed, a new image using the default image size will be used created instead. The default keybinding for this is <kbd>ctrl/cmd+'</kbd>.

**New Image with Default Size**

To go along with the above import from clipboard command, there is also a `luna.file.newDefaultSize` command that creates an image of the default size as configured in the `luna.defaultImageSize` setting. The default keybinding for this is <kbd>ctrl/cmd+shift+'</kbd>.

**Other enhancements**

- Creating a new image in a window with no folder open is now supported, the new file's path will default to the operating system's pictures folder.
- Resize and resize canvas now supports the shorthand "WxH" ([#38](https://github.com/lunapaint/vscode-luna-paint/issues/38)).
- The current image type is now displayed in the right of the status bar, where the language picker shows up for text files.
- The minimap is now hidden by default due to its performance issues until [workers are supported](https://github.com/microsoft/vscode/issues/87282), there is a new button in the status bar to conveniently toggle it ([#42](https://github.com/lunapaint/vscode-luna-paint/issues/42)).
- Increased the default `luna.hotExitMaxPixels` from 50000 to 65536 such that icons of size 256x256 are covered.
- Adopted the new workspace trust VS Code feature. Since Luna Paint doesn't do anything potentially dangerous the extension will be available even in untrusted workspaces.

### Bug Fixes

- Pencil: Improve contrast of the angle hover display when using shift+click.
- Rectangle: Saving while a rectangle is not yet finished will respect the selection.
- Backspace is now also used as the erase selection keybinding on macOS ([#39](https://github.com/lunapaint/vscode-luna-paint/issues/39)).
- Fixed restoring of non-dirty closed files ([#46](https://github.com/lunapaint/vscode-luna-paint/issues/46)).
- Fixed history being restored incorrectly on hot exit, leaving the editor in an invalid state.
- Fixed remote support ([#44](https://github.com/lunapaint/vscode-luna-paint/issues/44)).
- Fixed minimap window's position and how it could overlap with the layers window.
- Fix resize image/canvas requests sometimes canceling out when pressing enter in the quick pick.



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
- <kbd>ctrl/cmd+up</kbd>: Increment by 10
- <kbd>ctrl/cmd+down</kbd>: Decrement by 10
- <kbd>ctrl/cmd+left</kbd>: Set to minimum (if one exists)
- <kbd>ctrl/cmd+right</kbd>: Set the maximum value (if one exists)

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
- The `luna.view.fitToWindow` command (<kbd>ctrl/cmd+b</kbd> by default) will now lock scrolling via the edges or the screen until the mouse wheel is used ([#14](https://github.com/lunapaint/vscode-luna-paint/issues/14)).
- Tools with number options (eraser brush size, rectangle outline size) now use number inputs instead of dropdowns with few options.
- The fill, pencil, eraser, color picker and rectangle tools have matching cursors that show the active tool at the mouse position.

### Behavior Changes

- Changed the keybindings for zooming to avoid overriding <kbd>ctrl/cmd+b</kbd> as toggling the sidebar is useful to give more image editing space:
  - `luna.view.actualSize` is now <kbd>ctrl/cmd+9</kbd> (previously <kbd>ctrl/cmd+0</kbd>).
  - `luna.view.fitToWindow` is now <kbd>ctrl/cmd+0</kbd> (previously <kbd>ctrl/cmd+b</kbd>).

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
