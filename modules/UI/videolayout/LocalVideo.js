/* global $, config, APP */

/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';

import { i18next } from '../../../react/features/base/i18n';
import { JitsiTrackEvents } from '../../../react/features/base/lib-jitsi-meet';
import { VideoTrack } from '../../../react/features/base/media';
import { updateSettings } from '../../../react/features/base/settings';
import { getLocalVideoTrack } from '../../../react/features/base/tracks';
import Thumbnail from '../../../react/features/filmstrip/components/web/Thumbnail';
import { shouldDisplayTileView } from '../../../react/features/video-layout';
/* eslint-enable no-unused-vars */
import UIEvents from '../../../service/UI/UIEvents';


/**
 *
 */
export default class LocalVideo {
    /**
     *
     * @param {*} emitter
     */
    constructor(emitter) {
        this.videoSpanId = 'localVideoContainer';
        this.container = this.createContainer();
        this.$container = $(this.container);
        this.isLocal = true;
        this.renderThumbnail();

        if (!config.disableLocalVideoFlip) {
            this._buildContextMenu();
        }
        this.emitter = emitter;

        Object.defineProperty(this, 'id', {
            get() {
                return APP.conference.getMyUserId();
            }
        });

    }

    /**
     *
     */
    createContainer() {
        const containerSpan = document.createElement('span');

        containerSpan.classList.add('videocontainer');
        containerSpan.id = this.videoSpanId;

        return containerSpan;
    }

    /**
     * Renders the thumbnail.
     */
    renderThumbnail(isHovered = false) {
        ReactDOM.render(
            <Provider store = { APP.store }>
                <I18nextProvider i18n = { i18next }>
                    <Thumbnail participantID = { this.id } isHovered = { isHovered } />
                </I18nextProvider>
            </Provider>, this.container);
    }

    /**
     *
     * @param {*} stream
     */
    changeVideo(stream) {
        // eslint-disable-next-line eqeqeq
        const isVideo = stream.videoType != 'desktop';
        const settings = APP.store.getState()['features/base/settings'];

        this._enableDisableContextMenu(isVideo);
        this.setFlipX(isVideo ? settings.localFlipX : false);
    }

    /**
     * Sets the flipX state of the video.
     * @param val {boolean} true for flipped otherwise false;
     */
    setFlipX(val) {
        this.emitter.emit(UIEvents.LOCAL_FLIPX_CHANGED, val);
        if (val) {
            $($(this.container).find('video')[0]).addClass('flipVideoX');
        } else {
            $($(this.container).find('video')[0]).removeClass('flipVideoX');
        }
    }

    /**
     * Builds the context menu for the local video.
     */
    _buildContextMenu() {
        $.contextMenu({
            selector: `#${this.videoSpanId}`,
            zIndex: 10000,
            items: {
                flip: {
                    name: 'Flip',
                    callback: () => {
                        const { store } = APP;
                        const val = !store.getState()['features/base/settings']
                        .localFlipX;

                        this.setFlipX(val);
                        store.dispatch(updateSettings({
                            localFlipX: val
                        }));
                    }
                }
            },
            events: {
                show(options) {
                    options.items.flip.name
                        = APP.translation.generateTranslationHTML(
                            'videothumbnail.flip');
                }
            }
        });
    }

    /**
     * Enables or disables the context menu for the local video.
     * @param enable {boolean} true for enable, false for disable
     */
    _enableDisableContextMenu(enable) {
        if (this.$container.contextMenu) {
            this.$container.contextMenu(enable);
        }
    }
}
