package org.praxisplatform.uischema;

import com.fasterxml.jackson.annotation.JsonValue;

public enum IconPosition {
    LEFT("left"),
    RIGHT("right"),
    TOP("top"),
    BOTTOM("bottom"),
    TOP_LEFT("top-left"),
    TOP_RIGHT("top-right"),
    BOTTOM_LEFT("bottom-left"),
    BOTTOM_RIGHT("bottom-right"),
    TOP_START("top-start"),
    TOP_END("top-end"),
    BOTTOM_START("bottom-start"),
    BOTTOM_END("bottom-end"),
    START("start"), // left in ltr, right in rtl
    END("end"), // right in ltr, left in rtl
    CENTER("center"), // center in ltr and rtl
    INLINE("inline"), // inline with text
    INLINE_START("inline-start"), // inline with text, left in ltr, right in rtl
    INLINE_END("inline-end"), // inline with text, right in ltr, left in rtl
    INLINE_TOP("inline-top"), // inline with text, top in ltr and rtl
    INLINE_BOTTOM("inline-bottom"), // inline with text, bottom in ltr and rtl
    INLINE_START_TOP("inline-start-top"), // inline with text, left in ltr, right in rtl, top in ltr and rtl
    INLINE_START_BOTTOM("inline-start-bottom"), // inline with text, left in ltr, right in rtl, bottom in ltr and rtl
    INLINE_END_TOP("inline-end-top"), // inline with text, right in ltr, left in rtl, top in ltr and rtl
    NONE("none"); // caso queira esconder

    private final String value;
    IconPosition(String value) { this.value = value; }
    @JsonValue
    public String getValue() { return value; }
}
