package your.project.sample;

import org.apache.cordova.DroidGap;

import android.R;
import android.os.Bundle;
//import android.app.Activity;
import android.view.Menu;

public class SampleActivity extends DroidGap {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/home.html");
       
    }
    
}
