package com.thiriang.altimit;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

/* Pantalla completa: se esconden las barras de Android (abajo y arriba) para que un toque cerca del borde
   (por ejemplo en CURA) no mande el juego al inicio. Deslizando desde el borde vuelven a aparecer un rato. */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    private void hideBars() {
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars()); /* también la barra de arriba (hora, batería) */
        if (Build.VERSION.SDK_INT >= 28) { WindowManager.LayoutParams lp = getWindow().getAttributes(); lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES; getWindow().setAttributes(lp); }
    }
}
