package org.praxisplatform.uischema.numeric;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NumberFormatOptions {

    private String style;
    private String currency;
    private String currencyDisplay;

}
