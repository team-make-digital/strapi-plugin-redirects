import type React from "react";
interface RedirectSetting {
    enabled: boolean;
    slugField: string;
}
interface RedirectSettings {
    [contentTypeUid: string]: RedirectSetting;
}
declare const RedirectSettings: React.FC;
export default RedirectSettings;
