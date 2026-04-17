/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { Dimensions, Linking, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { defaultSystemFonts, CustomBlockRenderer } from "react-native-render-html";
import { SvgUri } from "react-native-svg";
import axios from "axios";
import { tokens } from "@shared/theme/tokens";
import { convertMarkdownToHTML, transformImageUrl, getGuideHTMLStyles } from "@features/control/utils/guideHelper";
import { GuideImage } from "@features/provision/components";

interface UseGuideReturn {
  markdownContent: string;
  isLoading: boolean;
  error: string | null;
  htmlContent: string;
  htmlStyles: ReturnType<typeof getGuideHTMLStyles>;
  customRenderers: { img: CustomBlockRenderer };
  renderersProps: { a: { onPress: (_: any, href: string) => void } };
  systemFonts: string[];
  screenWidth: number;
  handleBackPress: () => void;
  fromProvisionFlow: boolean;
}

/**
 * Custom hook for Guide screen business logic
 */
export const useGuide = (): UseGuideReturn => {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    url: string;
    title?: string;
    deviceName?: string;
    fromProvisionFlow?: string;
  }>();

  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const screenWidth = useMemo(() => Dimensions.get("window").width, []);

  useEffect(() => {
    const fetchMarkdown = async () => {
      if (!params.url) {
        setError(t("device.errors.noReadmeURLProvided"));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(params.url, {
          headers: {
            Accept: "text/markdown, text/plain, application/xml, */*",
          },
          timeout: 10000,
        });

        setMarkdownContent(response.data);
      } catch (err: any) {
        console.error("Error fetching markdown:", err);
        setError(err.message || "Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkdown();
  }, [params.url, t]);

  const htmlContent = useMemo(
    () => convertMarkdownToHTML(markdownContent),
    [markdownContent]
  );

  const htmlStyles = useMemo(() => getGuideHTMLStyles(), []);

  const customRenderers = useMemo(
    () => ({
      img: (({ tnode }) => {
        const rawSrc = tnode.attributes.src;
        const src = transformImageUrl(rawSrc);

        const specifiedWidth = parseInt(tnode.attributes.width, 10);
        const specifiedHeight = parseInt(tnode.attributes.height, 10);

        const width = specifiedWidth || 200;
        const height = specifiedHeight || Math.round(width * 1.5);

        if (!src) return null;

        if (src.toLowerCase().endsWith(".svg")) {
          return (
            <View style={{ alignItems: "center", marginVertical: 12 }}>
              <SvgUri uri={src} width={width} height={specifiedHeight || 50} />
            </View>
          );
        }

        return <GuideImage src={src} width={width} height={height} />;
      }) as CustomBlockRenderer,
    }),
    []
  );

  const renderersProps = useMemo(
    () => ({
      a: {
        onPress: (_: any, href: string) => {
          if (href) {
            Linking.openURL(href);
          }
        },
      },
    }),
    []
  );

  const systemFonts = useMemo(
    () => [...defaultSystemFonts, tokens.fonts.regular, tokens.fonts.medium],
    []
  );

  const handleBackPress = useCallback(() => {
    if (params.fromProvisionFlow === "true") {
      router.dismissTo("/(group)/Home" as any);
    } else {
      router.back();
    }
  }, [params.fromProvisionFlow, router]);

  return {
    markdownContent,
    isLoading,
    error,
    htmlContent,
    htmlStyles,
    customRenderers,
    renderersProps,
    systemFonts,
    screenWidth,
    handleBackPress,
    fromProvisionFlow: params.fromProvisionFlow === "true",
  };
};
