{
    function toArray(typedArray) {
        return Array.prototype.slice.call(typedArray);
    }

    xeogl.Bookmarks = class xeoglBookmarks extends xeogl.Component {

        init(cfg) {
            super.init();
            this._cameraFlight = new xeogl.CameraFlightAnimation(this);
            this._bookmarks = {};
            this.flyTo = cfg.flyTo;
            this.thumbnails = cfg.thumbnails;
            this.thumbnailSize = cfg.thumbnailSize;
        }

        set flyTo(value) {
            this._flyTo = value !== false;
        }

        get flyTo() {
            return this._flyTo;
        }

        set thumbnails(thumbnails) {
            this._thumbnails = thumbnails;
        }

        get thumbnails() {
            return this._thumbnails;
        }

        set thumbnailSize(thumbnailSize) {
            this._thumbnailSize = thumbnailSize || [150, 150]
        }

        get thumbnailSize() {
            return this._thumbnailSize;
        }

        get bookmarks() {
            return this._bookmarks;
        }

        save() {
            var id = "" + xeogl.math.createUUID();
            var scene = this.scene;
            var bookmark = {
                id: id,
                meta: {},
                visibleEntityIds: scene.visibleEntityIds.slice(0),
                ghostedEntityIds: scene.ghostedEntityIds.slice(0),
                highlightedEntityIds: scene.highlightedEntityIds.slice(0),
                selectedEntityIds: scene.selectedEntityIds.slice(0),
                camera: {
                    eye: toArray(scene.camera.eye),
                    look: toArray(scene.camera.look),
                    up: toArray(scene.camera.up),
                    projection: scene.camera.projection
                },
                screenshot: null
            };
            this._bookmarks[id] = bookmark;
            if (this._thumbnails) {
                var self = this;
                scene.canvas.getSnapshot({
                    width: this._thumbnailSize[0],
                    height: this._thumbnailSize[1],
                    format: "png"
                }, function (imageDataURL) {
                    bookmark.thumbnail = imageDataURL;
                    self.fire("saved", bookmark);
                });
            } else {
                this.fire("saved", bookmark);
            }
        }

        load(id) {
            var bookmark = this._bookmarks[id];
            if (!bookmark) {
                this.error("Bookmark not found: " + id);
                return;
            }
            var scene = this.scene;

            if (this._flyTo) {
                this._cameraFlight.flyTo({
                    eye: bookmark.camera.eye,
                    look: bookmark.camera.look,
                    up: bookmark.camera.up
                }, function () {
                    scene.setVisible(scene.visibleEntityIds, false);
                    scene.setVisible(bookmark.visibleEntityIds, true);
                    scene.setGhosted(scene.ghostedEntityIds, false);
                    scene.setGhosted(bookmark.ghostedEntityIds, true);
                    scene.setHighlighted(scene.highlightedEntityIds, false);
                    scene.setHighlighted(bookmark.highlightedEntityIds, true);
                    scene.setSelected(scene.selectedEntityIds, false);
                    scene.setSelected(bookmark.selectedEntityIds, true);
                });
            } else {
                scene.setVisible(scene.visibleEntityIds, false);
                scene.setVisible(bookmark.visibleEntityIds, true);
                scene.setGhosted(scene.ghostedEntityIds, false);
                scene.setGhosted(bookmark.ghostedEntityIds, true);
                scene.setHighlighted(scene.highlightedEntityIds, false);
                scene.setHighlighted(bookmark.highlightedEntityIds, true);
                scene.setSelected(scene.selectedEntityIds, false);
                scene.setSelected(bookmark.selectedEntityIds, true);

                scene.camera.eye = bookmark.camera.eye;
                scene.camera.look = bookmark.camera.look;
                scene.camera.up = bookmark.camera.up;
            }
        }

        remove(id) {
            delete this._bookmarks[id];
        }

        clear() {
            this._bookmarks = {};
        }
    }
}