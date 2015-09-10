﻿function webAudioBoomSoundFactory(audioContext: AudioContext, sound: ISound, sampleDurationSeconds: number): ISound {
    var frameCount = sampleDurationSeconds * audioContext.sampleRate;
    var buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < frameCount; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    return function (intensity: number) {
        // set up the frequency
        var now = audioContext.currentTime;
        var durationSeconds = sampleDurationSeconds;

        var staticNode = audioContext.createBufferSource();
        staticNode.buffer = buffer;
        staticNode.loop = true;

        var filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 1;
        filter.frequency.value = 700;

        //decay
        var gain = audioContext.createGain();
        var decay = durationSeconds * 0.2;
        linearRampGain(gain, now, intensity, intensity/2, durationSeconds * 0.002, decay, null, durationSeconds); 

        staticNode.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);


        // die
        setTimeout(function () {
            filter.disconnect();
            staticNode.disconnect();
            staticNode.stop();
        }, durationSeconds * 1000);



        staticNode.start();
        if (sound) {
            sound(intensity);
        }
    }

}

