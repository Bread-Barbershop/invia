'use client';

import { HTMLAttributes, useState } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { resolveSketchPalette } from '@/shared/map/sketch/palettes';
import { matchesSketchMapSettings } from '@/shared/map/sketch/sketchTypes';
import type { EditorBlock } from '@/shared/types/block';
import { formatPhoneNumber, toTelHref } from '@/shared/utils/phoneNumber';
import {
  getDefaultPlaceTitle,
  normalizePlaceTitle,
} from '@/shared/utils/placeTitle';

import { NaverMapScript } from './NaverMapScript';
import { Navigation } from './Navigation';
import { hasPlaceCoordinates } from './placeCoordinates';
import { PlaceMap } from './PlaceMap';
import { SketchErrorBoundary } from './sketch/SketchErrorBoundary';
import { SketchMapSvg } from './sketch/SketchMapSvg';
import { resolvePlaceSketchProps } from './sketch/sketchOptionsModel';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'place'>;
  className: string;
  titleClassName?: string;
  hideActions?: boolean;
  /**
   * 전화번호를 `tel:` 링크로 만들지 정한다.
   * 편집기 캔버스처럼 블록을 고르는 화면에서는 끈다.
   */
  enablePhoneLink?: boolean;
}

export const PlacePreview = ({
  blockInfo,
  className,
  titleClassName,
  hideActions,
  enablePhoneLink = true,
  ...rest
}: Props) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const {
    title,
    subTitle,
    placeName,
    placeDetail,
    placeAddress,
    placeTel,
    checkedSubTitle,
    checkedPlaceTel = false,
    mapLocked,
  } = blockInfo.props;
  const { lat, lng } = blockInfo.props;
  const showMap = blockInfo.props.openMap && hasPlaceCoordinates(lng, lat);
  const sketchProps = resolvePlaceSketchProps(blockInfo.props);
  const currentSketch =
    sketchProps.mapStyle === 'sketch' &&
    matchesSketchMapSettings(sketchProps.sketch, {
      lat,
      lng,
      radius: sketchProps.sketchRadius,
      density: sketchProps.sketchDensity,
    })
      ? sketchProps.sketch
      : null;
  const defaultTitle = getDefaultPlaceTitle(blockInfo.type);
  const { fontFamily, fontSize } = useBodyFontInfo();
  const telHref =
    checkedPlaceTel && !hideActions && enablePhoneLink
      ? toTelHref(placeTel)
      : null;
  const telLabel = `TEL. ${
    hideActions ? placeTel : formatPhoneNumber(placeTel ?? '')
  }`;
  const detailStyle = {
    fontFamily,
    fontSize: `max(1rem, ${fontSize ?? '1rem'})`,
  };

  return (
    <MiddlePreviewWrapper
      className={className}
      childClassName="gap-6"
      titleClassName={titleClassName}
      checkedSubTitle={checkedSubTitle}
      subTitle={subTitle}
      subTitleDefault="LOCATION"
      mainTitle={normalizePlaceTitle(title, blockInfo.type)}
      mainTitleDefault={defaultTitle}
      {...rest}
    >
      <NaverMapScript onReady={() => setIsScriptLoaded(true)} />
      <section
        className="flex flex-col justify-center items-center text-text-primary"
        style={detailStyle}
      >
        <p className="font-normal">{placeAddress}</p>
        <p className="font-normal">
          {placeName} {placeDetail}
        </p>
      </section>
      {checkedPlaceTel && Boolean(placeTel?.trim()) && (
        <p className="font-normal text-text-tertiary" style={detailStyle}>
          {telHref ? (
            <a
              href={telHref}
              className="underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {telLabel}
            </a>
          ) : (
            telLabel
          )}
        </p>
      )}

      {showMap && currentSketch && (
        <SketchErrorBoundary label="preview" fallback={null}>
          <SketchMapSvg
            data={currentSketch}
            palette={resolveSketchPalette(sketchProps.sketchPalette)}
            showStations={sketchProps.sketchShowStations}
            showVenueLabel={sketchProps.sketchShowLabel}
            showScale={sketchProps.sketchShowScale}
            venueLabel={placeName || placeAddress}
            className="overflow-hidden rounded-lg"
          />
        </SketchErrorBoundary>
      )}

      {showMap && !currentSketch && isScriptLoaded && (
        <PlaceMap
          lng={blockInfo.props.lng}
          lat={blockInfo.props.lat}
          category="preview"
          locked={Boolean(mapLocked)}
        />
      )}

      {showMap && blockInfo.props.openNavi && (
        <Navigation
          lat={blockInfo.props.lat}
          lng={blockInfo.props.lng}
          name={blockInfo.props.placeAddress}
        />
      )}
    </MiddlePreviewWrapper>
  );
};
