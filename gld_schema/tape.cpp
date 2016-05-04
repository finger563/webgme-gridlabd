class collector {
	char1024 property;
	char32 trigger;
	char1024 file;
	int32 limit;
	char256 group;
	double interval[s];
}

class group_recorder {
	char256 file; // output file name
	char1024 group; // group definition string
	double interval[s]; // recordering interval (0 'every iteration', -1 'on change')
	double flush_interval[s]; // file flush interval (0 never, negative on samples)
	bool strict; // causes the group_recorder to stop the simulation should there be a problem opening or writing with the group_recorder
	bool print_units; // flag to append units to each written value, if applicable
	char256 property; // property to record
	int32 limit; // the maximum number of lines to write to the file
	enumeration {ANG_RAD=5, ANG_DEG=4, MAG=3, IMAG=2, REAL=1, NONE=0} complex_part; // the complex part to record if complex properties are gathered
}

class histogram {
	char1024 filename; // the name of the file to write
	char8 filetype; // the format to output a histogram in
	char32 mode; // the mode of file output
	char1024 group; // the GridLAB-D group expression to use for this histogram
	char1024 bins; // the specific bin values to use
	char256 property; // the property to sample
	double min; // the minimum value of the auto-sized bins to use
	double max; // the maximum value of the auto-sized bins to use
	double samplerate[s]; // the rate at which samples are read
	double countrate[s]; // the reate at which bins are counted and written
	int32 bin_count; // the number of auto-sized bins to use
	int32 limit; // the number of samples to write
}

class multi_recorder {
	double interval[s];
	char1024 property;
	char32 trigger;
	char1024 file;
	char8 filetype;
	char32 mode;
	char1024 multifile;
	int32 limit;
	char1024 plotcommands;
	char32 xdata;
	char32 columns;
	enumeration {SVG=6, PNG=5, PDF=4, JPG=3, GIF=2, EPS=1, SCREEN=0} output;
	enumeration {NONE=2, ALL=1, DEFAULT=0} header_units;
	enumeration {NONE=2, ALL=1, DEFAULT=0} line_units;
}

class player {
	char256 property;
	char1024 file;
	char8 filetype;
	char32 mode;
	int32 loop;
}

class player {
	char256 property;
	char1024 file;
	char8 filetype;
	char32 mode;
	int32 loop;
}

class recorder {
	char1024 property;
	char32 trigger;
	char1024 file;
	char8 filetype;
	char32 mode;
	char1024 multifile;
	int32 limit;
	char1024 plotcommands;
	char32 xdata;
	char32 columns;
	double interval[s];
	enumeration {SVG=6, PNG=5, PDF=4, JPG=3, GIF=2, EPS=1, SCREEN=0} output;
	enumeration {NONE=2, ALL=1, DEFAULT=0} header_units;
	enumeration {NONE=2, ALL=1, DEFAULT=0} line_units;
}

class shaper {
	char1024 file;
	char8 filetype;
	char32 mode;
	char256 group;
	char256 property;
	double magnitude;
	double events;
}

