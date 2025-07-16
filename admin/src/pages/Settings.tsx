"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Main,
  Select,
  Typography,
  Alert,
  Loader,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Table, Thead, Tbody, Tr, Th, Td 
} from "@strapi/design-system"
import { Check, Information } from "@strapi/icons"
import { useFetchClient } from '@strapi/strapi/admin';
import { Layouts } from "@strapi/admin/strapi-admin"
import { SingleSelect } from "@strapi/design-system"
import { SingleSelectOption } from "@strapi/design-system"
import { Grid } from "@strapi/design-system"
import { useNotification } from '@strapi/strapi/admin';

interface ContentType {
  uid: string
  apiID: string
  attributes: Record<string, any>
}

interface RedirectSetting {
  enabled: boolean
  slugField: string
}

interface RedirectSettings {
  [contentTypeUid: string]: RedirectSetting
}

const RedirectSettings: React.FC = () => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [settings, setSettings] = useState<RedirectSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { get, post } = useFetchClient()

  // Fetch content types and settings on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const contentTypesResponse = await get("/content-manager/content-types")
      const filteredContentTypes = contentTypesResponse.data.data.filter(
        (ct: any) => ct.kind === "collectionType" && ct.uid.startsWith("api::"),
      )
      setContentTypes(filteredContentTypes)
      try {
        const settingsResponse = await get("/api/redirect-manager/settings")
        setSettings(settingsResponse.data.enabledContentTypes || {})
      } catch (settingsError) {
        setSettings({})
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again.")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Get string fields for a content type (potential slug fields)
  const getStringFields = (contentType: ContentType): string[] => {
    const stringFields: string[] = []
    Object.entries(contentType.attributes).forEach(([key, attribute]) => {
        if (attribute.type === "string" || attribute.type === "uid") {
            stringFields.push(key)
        }
    })

    return stringFields
  }

  // Handle checkbox change
  const handleEnabledChange = (contentTypeUid: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [contentTypeUid]: {
        ...prev[contentTypeUid],
        enabled,
        slugField: prev[contentTypeUid]?.slugField || "",
      },
    }))
  }

  // Handle slug field selection
  const handleSlugFieldChange = (contentTypeUid: string, slugField: string) => {
    setSettings((prev) => ({
      ...prev,
      [contentTypeUid]: {
        ...prev[contentTypeUid],
        slugField,
        enabled: prev[contentTypeUid]?.enabled || false,
      },
    }))
  }

  // Save settings
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      await post("/api/redirect-manager/settings", { enabledContentTypes:settings })

      setSuccess(true)
      toggleNotification({
        type: 'success',
        message: "Settings saved successfully!"
      });
      
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Failed to save settings. Please try again.")
      toggleNotification({
        type: 'danger',
        message: "Failed to save settings. Please try again."
      });
      console.error("Error saving settings:", err)
    } finally {
      setSaving(false)
    }
  }

  const { toggleNotification } = useNotification();


  if (loading) {
    return (
      <Main>
        <Layouts.Header title="Redirect Settings" subtitle="Configure redirect functionality for your content types" />
        <Layouts.Content>
          <Flex justifyContent="center" padding={8}>
            <Loader>Loading settings...</Loader>
          </Flex>
        </Layouts.Content>
      </Main>
    )
}

  return (
    <Main>
      <Layouts.Header
        title="Redirect Settings"
        subtitle="Configure redirect functionality for your content types"
        primaryAction={
          <Button onClick={handleSave} loading={saving} startIcon={<Check />} disabled={saving}>
            Save Settings
          </Button>
        }
      />
      <Layouts.Content>
        {/* <Box padding={8}> */}
          <div style={{fontSize:"1.4rem"}}>
          <Table colCount={3}>
            <Thead>
              <Tr>
                <Th>Status</Th>
                <Th>Content Type</Th>
                <Th>Slug Field</Th>
              </Tr>
            </Thead>
            <Tbody>
              {contentTypes.map((contentType,i) => {
                const stringFields = getStringFields(contentType);
                const currentSetting = settings[contentType.uid]
                return (
                    <Tr key={contentType.uid}>
                    <Td>
                        <Checkbox
                            checked={currentSetting?.enabled || false}
                            onCheckedChange={(e: boolean) =>
                                handleEnabledChange(contentType.uid, e)
                            }
                        />
                    </Td>
                    <Td>{contentType.apiID}</Td>
                    <Td>
                      <SingleSelect
                        label="Slug Field"
                        placeholder="Select a field to use as slug"
                        value={currentSetting?.slugField || ""}
                        onChange={(value: string) => handleSlugFieldChange(contentType.uid, value)}
                        disabled={!currentSetting?.enabled || stringFields.length === 0}
                      >
                        {stringFields.map((field) => (
                          <SingleSelectOption key={field} value={field}>
                            {field}
                          </SingleSelectOption>
                        ))}
                      </SingleSelect>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          </div>

          {contentTypes.length === 0 && (
            <Box padding={8} textAlign="center">
              <Typography variant="omega" textColor="neutral600">
                No content types found.
              </Typography>
            </Box>
          )}
        {/* </Box> */}
      </Layouts.Content>
    </Main>
  );
}

export default RedirectSettings
