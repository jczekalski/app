import React, {memo, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import styles from '../../../styles/styles';
import PDFView from '../../PDFView';
import Icon from '../../Icon';
import * as Expensicons from '../../Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import compose from '../../../libs/compose';
import Text from '../../Text';
import Tooltip from '../../Tooltip';
import themeColors from '../../../styles/themes/default';
import variables from '../../../styles/variables';
import addEncryptedAuthTokenToURL from '../../../libs/addEncryptedAuthTokenToURL';
import AttachmentViewImage from './AttachmentViewImage';

import {attachmentViewPropTypes, attachmentViewDefaultProps} from './propTypes';

const propTypes = {
    ...attachmentViewPropTypes,
    ...withLocalizePropTypes,

    /** Flag to show/hide download icon */
    shouldShowDownloadIcon: PropTypes.bool,

    /** Flag to show the loading indicator */
    shouldShowLoadingSpinnerIcon: PropTypes.bool,

    /** Notify parent that the UI should be modified to accommodate keyboard */
    onToggleKeyboard: PropTypes.func,

    /** Extra styles to pass to View wrapper */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    ...attachmentViewDefaultProps,
    shouldShowDownloadIcon: false,
    shouldShowLoadingSpinnerIcon: false,
    onToggleKeyboard: () => {},
    containerStyles: [],
};

function AttachmentView({item, isUsedInCarousel, onPress, shouldShowLoadingSpinnerIcon, shouldShowDownloadIcon, containerStyles, onScaleChanged, onToggleKeyboard, translate, isFocused}) {
    const [loadComplete, setLoadComplete] = useState(false);

    // Handles case where source is a component (ex: SVG)
    if (_.isFunction(item.source)) {
        return (
            <Icon
                src={item.source}
                height={variables.defaultAvatarPreviewSize}
                width={variables.defaultAvatarPreviewSize}
            />
        );
    }

    // Check both source and file.name since PDFs dragged into the the text field
    // will appear with a source that is a blob
    if (Str.isPDF(item.source) || (item.file && Str.isPDF(item.file.name || translate('attachmentView.unknownFilename')))) {
        const sourceURL = item.isAuthTokenRequired ? addEncryptedAuthTokenToURL(item.source) : item.source;
        return (
            <PDFView
                onPress={onPress}
                isFocused={isFocused}
                sourceURL={sourceURL}
                fileName={item.file.name}
                style={styles.imageModalPDF}
                onToggleKeyboard={onToggleKeyboard}
                onScaleChanged={onScaleChanged}
                onLoadComplete={() => !loadComplete && setLoadComplete(true)}
            />
        );
    }

    // For this check we use both source and file.name since temporary file source is a blob
    // both PDFs and images will appear as images when pasted into the the text field
    const isImage = Str.isImage(item.source);
    if (isImage || (item.file && Str.isImage(item.file.name))) {
        return (
            <AttachmentViewImage
                item={item}
                isUsedInCarousel={isUsedInCarousel}
                loadComplete={loadComplete}
                isFocused={isFocused}
                isImage={isImage}
                onPress={onPress}
                onScaleChanged={onScaleChanged}
            />
        );
    }

    return (
        <View style={[styles.defaultAttachmentView, ...containerStyles]}>
            <View style={styles.mr2}>
                <Icon src={Expensicons.Paperclip} />
            </View>

            <Text style={[styles.textStrong, styles.flexShrink1, styles.breakAll, styles.flexWrap, styles.mw100]}>{item.file && item.file.name}</Text>
            {!shouldShowLoadingSpinnerIcon && shouldShowDownloadIcon && (
                <Tooltip text={translate('common.download')}>
                    <View style={styles.ml2}>
                        <Icon src={Expensicons.Download} />
                    </View>
                </Tooltip>
            )}
            {shouldShowLoadingSpinnerIcon && (
                <View style={styles.ml2}>
                    <Tooltip text={translate('common.downloading')}>
                        <ActivityIndicator
                            size="small"
                            color={themeColors.textSupporting}
                        />
                    </Tooltip>
                </View>
            )}
        </View>
    );
}

AttachmentView.propTypes = propTypes;
AttachmentView.defaultProps = defaultProps;
AttachmentView.displayName = 'AttachmentView';

export default compose(memo, withLocalize)(AttachmentView);
