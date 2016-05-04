class battery {
	enumeration {POWER_VOLTAGE_HYBRID=7, VOLTAGE_CONTROLLED=6, POWER_DRIVEN=5, SUPPLY_DRIVEN=4, CONSTANT_PF=3, CONSTANT_PQ=2, CONSTANT_V=1, UNKNOWN=0} generator_mode;
	enumeration {LINEAR_TEMPERATURE=1, NONE=0} additional_controls;
	enumeration {ONLINE=2, OFFLINE=1} generator_status;
	enumeration {LARGE=4, MED_HIGH_ENERGY=3, MED_COMMERCIAL=2, SMALL=1, HOUSEHOLD=5} rfb_size;
	enumeration {DC=1, AC=2} power_type;
	enumeration {CONFLICTED=5, EMPTY=4, FULL=3, WAITING=0, DISCHARGING=2, CHARGING=1} battery_state;
	double number_battery_state_changes;
	double monitored_power[W];
	double power_set_high[W];
	double power_set_low[W];
	double power_set_high_highT[W];
	double power_set_low_highT[W];
	double check_power_low[W];
	double check_power_high[W];
	double voltage_set_high[V];
	double voltage_set_low[V];
	double deadband[V];
	double sensitivity;
	double high_temperature;
	double midpoint_temperature;
	double low_temperature;
	double scheduled_power[W];
	double Rinternal[Ohm];
	double V_Max[V];
	complex I_Max[A];
	double E_Max[Wh];
	double P_Max[W];
	double power_factor;
	double Energy[Wh];
	double efficiency[unit];
	double base_efficiency[unit];
	double parasitic_power_draw[W];
	double Rated_kVA[kVA];
	complex V_Out[V];
	complex I_Out[A];
	complex VA_Out[VA];
	complex V_In[V];
	complex I_In[A];
	complex V_Internal[V];
	complex I_Internal[A];
	complex I_Prev[A];
	double power_transferred;
	bool use_internal_battery_model;
	enumeration {LEAD_ACID=2, LI_ION=1, UNKNOWON=0} battery_type;
	double nominal_voltage[V];
	double rated_power[W];
	double battery_capacity[Wh];
	double round_trip_efficiency[pu];
	double state_of_charge[pu];
	double battery_load[W];
	double reserve_state_of_charge[pu];
}

class central_dg_control {
	char32 controlled_dgs; // the group ID of the dg objects the controller controls.
	object feederhead_meter; // the name of the meter.
	enumeration {PEAK_SHAVING=2, CONSTANT_PF=1, NO_CONTROL=0} control_mode_0;
	enumeration {PEAK_SHAVING=2, CONSTANT_PF=1, NO_CONTROL=0} control_mode_1;
	enumeration {PEAK_SHAVING=2, CONSTANT_PF=1, NO_CONTROL=0} control_mode_2;
	enumeration {PEAK_SHAVING=2, CONSTANT_PF=1, NO_CONTROL=0} control_mode_3;
	double peak_S[W];
	double pf_low[unit];
	double pf_high[unit];
}

class dc_dc_converter {
	enumeration {BUCK_BOOST=2, BOOST=1, BUCK=0} dc_dc_converter_type;
	enumeration {SUPPLY_DRIVEN=5, CONSTANT_PF=4, CONSTANT_PQ=2, CONSTANT_V=1, UNKNOWN=0} generator_mode;
	complex V_Out[V];
	complex I_Out[A];
	complex Vdc[V];
	complex VA_Out[VA];
	double P_Out;
	double Q_Out;
	double service_ratio;
	complex V_In[V];
	complex I_In[A];
	complex VA_In[VA];
	set {S=112, N=8, C=4, B=2, A=1} phases;
}

class diesel_dg {
	function interupdate_gen_object();
	function postupdate_gen_object();
	enumeration {CONSTANTP=2, CONSTANTPQ=3, CONSTANTE=1, UNKNOWN=0} Gen_mode;
	enumeration {ONLINE=2, OFFLINE=1, UNKNOWN=0} Gen_status;
	enumeration {DYN_SYNCHRONOUS=3, SYNCHRONOUS=2, INDUCTION=1} Gen_type; // Dynamics-capable implementation of synchronous diesel generator
	double pf; // desired power factor
	double GenElecEff; // calculated electrical efficiency of generator
	complex TotalOutputPow[VA]; // total complex power generated
	double TotalRealPow[W]; // total real power generated
	double TotalReacPow[VAr]; // total reactive power generated
	double speed[1/min]; // speed of an engine
	double cylinders; // Total number of cylinders in a diesel engine
	double stroke; // category of internal combustion engines
	double torque[N]; // Net brake load
	double pressure[N/m^2]; // 
	double time_operation[min]; // 
	double fuel[kg]; // fuel consumption
	double w_coolingwater[kg]; // weight of cooling water supplied per minute
	double inlet_temperature[degC]; // Inlet temperature of cooling water in degC
	double outlet_temperature[degC]; // outlet temperature of cooling water in degC
	double air_fuel[kg]; // Air used per kg fuel
	double room_temperature[degC]; // Room temperature in degC
	double exhaust_temperature[degC]; // exhaust gas temperature in degC
	double cylinder_length[m]; // length of the cylinder, used in efficiency calculations
	double cylinder_radius[m]; // inner radius of cylinder, used in efficiency calculations
	double brake_diameter[m]; // diameter of brake, used in efficiency calculations
	double calotific_fuel[kJ/kg]; // calorific value of fuel
	double steam_exhaust[kg]; // steam formed per kg of fuel in the exhaust
	double specific_heat_steam[kJ/kg/K]; // specific heat of steam in exhaust
	double specific_heat_dry[kJ/kg/K]; // specific heat of dry exhaust gases
	double indicated_hp[W]; // Indicated horse power is the power developed inside the cylinder
	double brake_hp[W]; // brake horse power is the output of the engine at the shaft measured by a dynamometer
	double thermal_efficiency; // thermal efficiency or mechanical efiiciency of the engine is efined as bp/ip
	double energy_supplied[kJ]; // energy supplied during the trail
	double heat_equivalent_ip[kJ]; // heat equivalent of IP in a given time of operation
	double energy_coolingwater[kJ]; // energy carried away by cooling water
	double mass_exhaustgas[kg]; // mass of dry exhaust gas
	double energy_exhaustgas[kJ]; // energy carried away by dry exhaust gases
	double energy_steam[kJ]; // energy carried away by steam
	double total_energy_exhaustgas[kJ]; // total energy carried away by dry exhaust gases is the sum of energy carried away bt steam and energy carried away by dry exhaust gases
	double unaccounted_energyloss[kJ]; // unaccounted for energy loss
	double Pconv[kW]; // Converted power = Mechanical input - (F & W loasses + Stray losses + Core losses)
	double Rated_V[V]; // nominal line-line voltage in Volts
	double Rated_VA[VA]; // nominal capacity in VA
	complex power_out_A[VA]; // Output power of phase A
	complex power_out_B[VA]; // Output power of phase B
	complex power_out_C[VA]; // Output power of phase C
	double Rs; // internal transient resistance in p.u.
	double Xs; // internal transient impedance in p.u.
	double Rg; // grounding resistance in p.u.
	double Xg; // grounding impedance in p.u.
	complex voltage_A[V]; // voltage at generator terminal, phase A
	complex voltage_B[V]; // voltage at generator terminal, phase B
	complex voltage_C[V]; // voltage at generator terminal, phase C
	complex current_A[A]; // current generated at generator terminal, phase A
	complex current_B[A]; // current generated at generator terminal, phase B
	complex current_C[A]; // current generated at generator terminal, phase C
	complex EfA[V]; // induced voltage on phase A
	complex EfB[V]; // induced voltage on phase B
	complex EfC[V]; // induced voltage on phase C
	double omega_ref[rad/s]; // Reference frequency of generator (rad/s)
	double inertia; // Inertial constant (H) of generator
	double damping; // Damping constant (D) of generator
	double number_poles; // Number of poles in the generator
	double Ra[pu]; // Stator resistance (p.u.)
	double Xd[pu]; // d-axis reactance (p.u.)
	double Xq[pu]; // q-axis reactance (p.u.)
	double Xdp[pu]; // d-axis transient reactance (p.u.)
	double Xqp[pu]; // q-axis transient reactance (p.u.)
	double Xdpp[pu]; // d-axis subtransient reactance (p.u.)
	double Xqpp[pu]; // q-axis subtransient reactance (p.u.)
	double Xl[pu]; // Leakage reactance (p.u.)
	double Tdp[s]; // d-axis short circuit time constant (s)
	double Tdop[s]; // d-axis open circuit time constant (s)
	double Tqop[s]; // q-axis open circuit time constant (s)
	double Tdopp[s]; // d-axis open circuit subtransient time constant (s)
	double Tqopp[s]; // q-axis open circuit subtransient time constant (s)
	double Ta[s]; // Armature short-circuit time constant (s)
	complex X0[pu]; // Zero sequence impedance (p.u.)
	complex X2[pu]; // Negative sequence impedance (p.u.)
	double rotor_speed_convergence[rad]; // Convergence criterion on rotor speed used to determine when to exit deltamode
	double rotor_angle[rad]; // rotor angle state variable
	double rotor_speed[rad/s]; // machine speed state variable
	double field_voltage[pu]; // machine field voltage state variable
	double flux1d[pu]; // machine transient flux on d-axis state variable
	double flux2q[pu]; // machine subtransient flux on q-axis state variable
	complex EpRotated[pu]; // d-q rotated E-prime internal voltage state variable
	complex VintRotated[pu]; // d-q rotated Vint voltage state variable
	complex Eint_A[V]; // Unrotated, unsequenced phase A internal voltage
	complex Eint_B[V]; // Unrotated, unsequenced phase B internal voltage
	complex Eint_C[V]; // Unrotated, unsequenced phase C internal voltage
	complex Irotated[pu]; // d-q rotated sequence current state variable
	complex pwr_electric[VA]; // Current electrical output of machine
	double pwr_mech[W]; // Current mechanical output of machine
	double torque_mech[N*m]; // Current mechanical torque of machine
	double torque_elec[N*m]; // Current electrical torque output of machine
	enumeration {SEXS=2, NO_EXC=1} Exciter_type; // Simplified Excitation System
	double KA[pu]; // Exciter gain (p.u.)
	double TA[s]; // Exciter time constant (seconds)
	double TB[s]; // Exciter transient gain reduction time constant (seconds)
	double TC[s]; // Exciter transient gain reduction time constant (seconds)
	double EMAX[pu]; // Exciter upper limit (p.u.)
	double EMIN[pu]; // Exciter lower limit (p.u.)
	double Vterm_max[pu]; // Upper voltage limit for super-second (p.u.)
	double Vterm_min[pu]; // Lower voltage limit for super-second (p.u.)
	double vset[pu]; // Exciter voltage set point state variable
	double bias; // Exciter bias state variable
	double xe; // Exciter state variable
	double xb; // Exciter state variable
	enumeration {GAST=3, DEGOV1=2, NO_GOV=1} Governor_type; // GAST Gas Turbine Governor
	double DEGOV1_R[pu]; // Governor droop constant (p.u.)
	double DEGOV1_T1[s]; // Governor electric control box time constant (s)
	double DEGOV1_T2[s]; // Governor electric control box time constant (s)
	double DEGOV1_T3[s]; // Governor electric control box time constant (s)
	double DEGOV1_T4[s]; // Governor actuator time constant (s)
	double DEGOV1_T5[s]; // Governor actuator time constant (s)
	double DEGOV1_T6[s]; // Governor actuator time constant (s)
	double DEGOV1_K[pu]; // Governor actuator gain
	double DEGOV1_TMAX[pu]; // Governor actuator upper limit (p.u.)
	double DEGOV1_TMIN[pu]; // Governor actuator lower limit (p.u.)
	double DEGOV1_TD[s]; // Governor combustion delay (s)
	double DEGOV1_wref[pu]; // Governor reference frequency state variable
	double DEGOV1_x1; // Governor electric box state variable
	double DEGOV1_x2; // Governor electric box state variable
	double DEGOV1_x4; // Governor electric box state variable
	double DEGOV1_x5; // Governor electric box state variable
	double DEGOV1_x6; // Governor electric box state variable
	double DEGOV1_throttle; // Governor electric box state variable
	double GAST_R[pu]; // Governor droop constant (p.u.)
	double GAST_T1[s]; // Governor electric control box time constant (s)
	double GAST_T2[s]; // Governor electric control box time constant (s)
	double GAST_T3[s]; // Governor temperature limiter time constant (s)
	double GAST_AT[s]; // Governor Ambient Temperature load limit (units)
	double GAST_KT[pu]; // Governor temperature control loop gain
	double GAST_VMAX[pu]; // Governor actuator upper limit (p.u.)
	double GAST_VMIN[pu]; // Governor actuator lower limit (p.u.)
	double GAST_x1; // Governor electric box state variable
	double GAST_x2; // Governor electric box state variable
	double GAST_x3; // Governor electric box state variable
	double GAST_throttle; // Governor electric box state variable
	set {S=112, N=8, C=4, B=2, A=1} phases; // Specifies which phases to connect to - currently not supported and assumes three-phase connection
}

class diesel_dg {
	function interupdate_gen_object();
	function postupdate_gen_object();
	enumeration {CONSTANTP=2, CONSTANTPQ=3, CONSTANTE=1, UNKNOWN=0} Gen_mode;
	enumeration {ONLINE=2, OFFLINE=1, UNKNOWN=0} Gen_status;
	enumeration {DYN_SYNCHRONOUS=3, SYNCHRONOUS=2, INDUCTION=1} Gen_type; // Dynamics-capable implementation of synchronous diesel generator
	double pf; // desired power factor
	double GenElecEff; // calculated electrical efficiency of generator
	complex TotalOutputPow[VA]; // total complex power generated
	double TotalRealPow[W]; // total real power generated
	double TotalReacPow[VAr]; // total reactive power generated
	double speed[1/min]; // speed of an engine
	double cylinders; // Total number of cylinders in a diesel engine
	double stroke; // category of internal combustion engines
	double torque[N]; // Net brake load
	double pressure[N/m^2]; // 
	double time_operation[min]; // 
	double fuel[kg]; // fuel consumption
	double w_coolingwater[kg]; // weight of cooling water supplied per minute
	double inlet_temperature[degC]; // Inlet temperature of cooling water in degC
	double outlet_temperature[degC]; // outlet temperature of cooling water in degC
	double air_fuel[kg]; // Air used per kg fuel
	double room_temperature[degC]; // Room temperature in degC
	double exhaust_temperature[degC]; // exhaust gas temperature in degC
	double cylinder_length[m]; // length of the cylinder, used in efficiency calculations
	double cylinder_radius[m]; // inner radius of cylinder, used in efficiency calculations
	double brake_diameter[m]; // diameter of brake, used in efficiency calculations
	double calotific_fuel[kJ/kg]; // calorific value of fuel
	double steam_exhaust[kg]; // steam formed per kg of fuel in the exhaust
	double specific_heat_steam[kJ/kg/K]; // specific heat of steam in exhaust
	double specific_heat_dry[kJ/kg/K]; // specific heat of dry exhaust gases
	double indicated_hp[W]; // Indicated horse power is the power developed inside the cylinder
	double brake_hp[W]; // brake horse power is the output of the engine at the shaft measured by a dynamometer
	double thermal_efficiency; // thermal efficiency or mechanical efiiciency of the engine is efined as bp/ip
	double energy_supplied[kJ]; // energy supplied during the trail
	double heat_equivalent_ip[kJ]; // heat equivalent of IP in a given time of operation
	double energy_coolingwater[kJ]; // energy carried away by cooling water
	double mass_exhaustgas[kg]; // mass of dry exhaust gas
	double energy_exhaustgas[kJ]; // energy carried away by dry exhaust gases
	double energy_steam[kJ]; // energy carried away by steam
	double total_energy_exhaustgas[kJ]; // total energy carried away by dry exhaust gases is the sum of energy carried away bt steam and energy carried away by dry exhaust gases
	double unaccounted_energyloss[kJ]; // unaccounted for energy loss
	double Pconv[kW]; // Converted power = Mechanical input - (F & W loasses + Stray losses + Core losses)
	double Rated_V[V]; // nominal line-line voltage in Volts
	double Rated_VA[VA]; // nominal capacity in VA
	complex power_out_A[VA]; // Output power of phase A
	complex power_out_B[VA]; // Output power of phase B
	complex power_out_C[VA]; // Output power of phase C
	double Rs; // internal transient resistance in p.u.
	double Xs; // internal transient impedance in p.u.
	double Rg; // grounding resistance in p.u.
	double Xg; // grounding impedance in p.u.
	complex voltage_A[V]; // voltage at generator terminal, phase A
	complex voltage_B[V]; // voltage at generator terminal, phase B
	complex voltage_C[V]; // voltage at generator terminal, phase C
	complex current_A[A]; // current generated at generator terminal, phase A
	complex current_B[A]; // current generated at generator terminal, phase B
	complex current_C[A]; // current generated at generator terminal, phase C
	complex EfA[V]; // induced voltage on phase A
	complex EfB[V]; // induced voltage on phase B
	complex EfC[V]; // induced voltage on phase C
	double omega_ref[rad/s]; // Reference frequency of generator (rad/s)
	double inertia; // Inertial constant (H) of generator
	double damping; // Damping constant (D) of generator
	double number_poles; // Number of poles in the generator
	double Ra[pu]; // Stator resistance (p.u.)
	double Xd[pu]; // d-axis reactance (p.u.)
	double Xq[pu]; // q-axis reactance (p.u.)
	double Xdp[pu]; // d-axis transient reactance (p.u.)
	double Xqp[pu]; // q-axis transient reactance (p.u.)
	double Xdpp[pu]; // d-axis subtransient reactance (p.u.)
	double Xqpp[pu]; // q-axis subtransient reactance (p.u.)
	double Xl[pu]; // Leakage reactance (p.u.)
	double Tdp[s]; // d-axis short circuit time constant (s)
	double Tdop[s]; // d-axis open circuit time constant (s)
	double Tqop[s]; // q-axis open circuit time constant (s)
	double Tdopp[s]; // d-axis open circuit subtransient time constant (s)
	double Tqopp[s]; // q-axis open circuit subtransient time constant (s)
	double Ta[s]; // Armature short-circuit time constant (s)
	complex X0[pu]; // Zero sequence impedance (p.u.)
	complex X2[pu]; // Negative sequence impedance (p.u.)
	double rotor_speed_convergence[rad]; // Convergence criterion on rotor speed used to determine when to exit deltamode
	double rotor_angle[rad]; // rotor angle state variable
	double rotor_speed[rad/s]; // machine speed state variable
	double field_voltage[pu]; // machine field voltage state variable
	double flux1d[pu]; // machine transient flux on d-axis state variable
	double flux2q[pu]; // machine subtransient flux on q-axis state variable
	complex EpRotated[pu]; // d-q rotated E-prime internal voltage state variable
	complex VintRotated[pu]; // d-q rotated Vint voltage state variable
	complex Eint_A[V]; // Unrotated, unsequenced phase A internal voltage
	complex Eint_B[V]; // Unrotated, unsequenced phase B internal voltage
	complex Eint_C[V]; // Unrotated, unsequenced phase C internal voltage
	complex Irotated[pu]; // d-q rotated sequence current state variable
	complex pwr_electric[VA]; // Current electrical output of machine
	double pwr_mech[W]; // Current mechanical output of machine
	double torque_mech[N*m]; // Current mechanical torque of machine
	double torque_elec[N*m]; // Current electrical torque output of machine
	enumeration {SEXS=2, NO_EXC=1} Exciter_type; // Simplified Excitation System
	double KA[pu]; // Exciter gain (p.u.)
	double TA[s]; // Exciter time constant (seconds)
	double TB[s]; // Exciter transient gain reduction time constant (seconds)
	double TC[s]; // Exciter transient gain reduction time constant (seconds)
	double EMAX[pu]; // Exciter upper limit (p.u.)
	double EMIN[pu]; // Exciter lower limit (p.u.)
	double Vterm_max[pu]; // Upper voltage limit for super-second (p.u.)
	double Vterm_min[pu]; // Lower voltage limit for super-second (p.u.)
	double vset[pu]; // Exciter voltage set point state variable
	double bias; // Exciter bias state variable
	double xe; // Exciter state variable
	double xb; // Exciter state variable
	enumeration {GAST=3, DEGOV1=2, NO_GOV=1} Governor_type; // GAST Gas Turbine Governor
	double DEGOV1_R[pu]; // Governor droop constant (p.u.)
	double DEGOV1_T1[s]; // Governor electric control box time constant (s)
	double DEGOV1_T2[s]; // Governor electric control box time constant (s)
	double DEGOV1_T3[s]; // Governor electric control box time constant (s)
	double DEGOV1_T4[s]; // Governor actuator time constant (s)
	double DEGOV1_T5[s]; // Governor actuator time constant (s)
	double DEGOV1_T6[s]; // Governor actuator time constant (s)
	double DEGOV1_K[pu]; // Governor actuator gain
	double DEGOV1_TMAX[pu]; // Governor actuator upper limit (p.u.)
	double DEGOV1_TMIN[pu]; // Governor actuator lower limit (p.u.)
	double DEGOV1_TD[s]; // Governor combustion delay (s)
	double DEGOV1_wref[pu]; // Governor reference frequency state variable
	double DEGOV1_x1; // Governor electric box state variable
	double DEGOV1_x2; // Governor electric box state variable
	double DEGOV1_x4; // Governor electric box state variable
	double DEGOV1_x5; // Governor electric box state variable
	double DEGOV1_x6; // Governor electric box state variable
	double DEGOV1_throttle; // Governor electric box state variable
	double GAST_R[pu]; // Governor droop constant (p.u.)
	double GAST_T1[s]; // Governor electric control box time constant (s)
	double GAST_T2[s]; // Governor electric control box time constant (s)
	double GAST_T3[s]; // Governor temperature limiter time constant (s)
	double GAST_AT[s]; // Governor Ambient Temperature load limit (units)
	double GAST_KT[pu]; // Governor temperature control loop gain
	double GAST_VMAX[pu]; // Governor actuator upper limit (p.u.)
	double GAST_VMIN[pu]; // Governor actuator lower limit (p.u.)
	double GAST_x1; // Governor electric box state variable
	double GAST_x2; // Governor electric box state variable
	double GAST_x3; // Governor electric box state variable
	double GAST_throttle; // Governor electric box state variable
	set {S=112, N=8, C=4, B=2, A=1} phases; // Specifies which phases to connect to - currently not supported and assumes three-phase connection
}

class energy_storage {
	enumeration {SUPPLY_DRIVEN=4, CONSTANT_PF=3, CONSTANT_PQ=2, CONSTANT_V=1, UNKNOWN=0} generator_mode;
	enumeration {ONLINE=2, OFFLINE=1} generator_status;
	enumeration {DC=0, AC=1} power_type;
	double Rinternal;
	double V_Max[V];
	complex I_Max[A];
	double E_Max;
	double Energy;
	double efficiency;
	double Rated_kVA[kVA];
	complex V_Out[V];
	complex I_Out[A];
	complex VA_Out[VA];
	complex V_In[V];
	complex I_In[A];
	complex V_Internal[V];
	complex I_Internal[A];
	complex I_Prev[A];
	set {S=112, N=8, C=4, B=2, A=1} phases;
}

class inverter {
	function interupdate_gen_object();
	function postupdate_gen_object();
	enumeration {FOUR_QUADRANT=4, PWM=3, TWELVE_PULSE=2, SIX_PULSE=1, TWO_PULSE=0} inverter_type;
	enumeration {GROUP_LOAD_FOLLOWING=7, GENERIC_DROOP=6, LOAD_FOLLOWING=5, CONSTANT_PF=2, CONSTANT_PQ=1, NONE=0} four_quadrant_control_mode;
	enumeration {EXCLUDED=2, INCLUDED=1} pf_reg;
	enumeration {ONLINE=2, OFFLINE=1} generator_status;
	enumeration {SUPPLY_DRIVEN=5, CONSTANT_PF=4, CONSTANT_PQ=2, CONSTANT_V=1, UNKNOWN=0} generator_mode;
	enumeration {ISLANDING_DROOP=1, CONTROL_SWITCH_NONE=0} control_mode_switch;
	enumeration {COUPLING_LCL=2, COUPLING_L=1, NONE=0} coupling_inductance_type;
	double inverter_convergence_criterion;
	complex V_In[V];
	complex I_In[A];
	complex VA_In[VA];
	complex VA_Out[VA];
	double Vdc[V];
	complex phaseA_V_Out[V];
	complex phaseB_V_Out[V];
	complex phaseC_V_Out[V];
	complex phaseA_I_Out[V];
	complex phaseB_I_Out[V];
	complex phaseC_I_Out[V];
	complex power_A[VA];
	complex power_B[VA];
	complex power_C[VA];
	double P_Out[VA];
	double Q_Out[VAr];
	double power_in[W];
	double rated_power[VA];
	double rated_battery_power[W];
	double inverter_efficiency;
	double battery_soc[pu];
	double soc_reserve[pu];
	double power_factor[unit];
	double nominal_frequency[Hz];
	double nominal_VRMSLG[V];
	bool islanded_state;
	double droop_P1[W];
	double droop_P2[W];
	double droop_Q1[VAr];
	double droop_Q2[VAr];
	double droop_f1[Hz];
	double droop_f2[Hz];
	double droop_V1[V];
	double droop_V2[V];
	double constant_PQ_KPPLL[unit];
	double constant_PQ_KIPLL[unit];
	double constant_PQ_KPP[unit];
	double constant_PQ_KIP[unit];
	double constant_PQ_KPQ[unit];
	double constant_PQ_KIQ[unit];
	double constant_PQ_T_MeasP[s];
	double constant_PQ_T_MeasQ[s];
	double constant_PQ_T_MeasV[s];
	double constant_PQ_TPRefFilter[s];
	double constant_PQ_TQRefFilter[s];
	double constant_PQ_vt_max_angle_ref[rad];
	double constant_PQ_vt_min_angle_ref[rad];
	double constant_PQ_vt_max_mag_ref[pu];
	double constant_PQ_vt_min_mag_ref[pu];
	double droop_PQ_KPPLL[unit];
	double droop_PQ_KIPLL[unit];
	double droop_PQ_KPP[unit];
	double droop_PQ_KIP[unit];
	double droop_PQ_KPQ[unit];
	double droop_PQ_KIQ[unit];
	double droop_PQ_T_MeasP[s];
	double droop_PQ_T_MeasQ[s];
	double droop_PQ_T_MeasV[s];
	double droop_PQ_TPRefFilter[s];
	double droop_PQ_TQRefFilter[s];
	double droop_PQ_vt_max_angle_ref[rad];
	double droop_PQ_vt_min_angle_ref[rad];
	double droop_PQ_vt_max_mag_ref[pu];
	double droop_PQ_vt_min_mag_ref[pu];
	double coupling_L1[H];
	double coupling_L2[H];
	double coupling_C[F];
	double initial_inverter_frequency[Hz];
	double measured_VRMSLL[V];
	double filtered_reference_output_P[VA];
	double filtered_reference_output_Q[VAr];
	double inverter_measured_terminal_P[W];
	double inverter_measured_terminal_Q[VAr];
	double inverter_measured_coupling_P[W];
	double inverter_measured_coupling_Q[VAr];
	double inverter_true_coupling_P[W];
	double inverter_true_coupling_Q[VAr];
	double PLL_measured_frequency[Hz];
	complex internal_vt_a[V];
	complex internal_vt_synch_a[V];
	complex vO_a[V];
	complex vO_synch_a[V];
	complex norton_i_a[A];
	complex iO_a[A];
	complex vO_dq[V];
	double theta_PLL[rad];
	set {S=112, N=8, C=4, B=2, A=1} phases;
	bool use_multipoint_efficiency;
	enumeration {XANTREX=3, SMA=2, FRONIUS=1, NONE=0} inverter_manufacturer;
	double maximum_dc_power;
	double maximum_dc_voltage;
	double minimum_dc_power;
	double c_0;
	double c_1;
	double c_2;
	double c_3;
	object sense_object; // name of the object the inverter is trying to mitigate the load on (node/link) in LOAD_FOLLOWING
	double max_charge_rate[W]; // maximum rate the battery can be charged in LOAD_FOLLOWING
	double max_discharge_rate[W]; // maximum rate the battery can be discharged in LOAD_FOLLOWING
	double charge_on_threshold[W]; // power level at which the inverter should try charging the battery in LOAD_FOLLOWING
	double charge_off_threshold[W]; // power level at which the inverter should cease charging the battery in LOAD_FOLLOWING
	double discharge_on_threshold[W]; // power level at which the inverter should try discharging the battery in LOAD_FOLLOWING
	double discharge_off_threshold[W]; // power level at which the inverter should cease discharging the battery in LOAD_FOLLOWING
	double excess_input_power[W]; // Excess power at the input of the inverter that is otherwise just lost, or could be shunted to a battery
	double charge_lockout_time[s]; // Lockout time when a charging operation occurs before another LOAD_FOLLOWING dispatch operation can occur
	double discharge_lockout_time[s]; // Lockout time when a discharging operation occurs before another LOAD_FOLLOWING dispatch operation can occur
	double pf_reg_activate; // Lowest acceptable power-factor level below which power-factor regulation will activate.
	double pf_reg_deactivate; // Lowest acceptable power-factor above which no power-factor regulation is needed.
	double pf_reg_activate_lockout_time[s]; // Mandatory pause between the deactivation of power-factor regulation and it reactivation
	double charge_threshold[W]; // Level at which all inverters in the group will begin charging attached batteries. Regulated minimum load level.
	double discharge_threshold[W]; // Level at which all inverters in the group will begin discharging attached batteries. Regulated maximum load level.
	double group_max_charge_rate[W]; // Sum of the charge rates of the batteries involved in the group load-following.
	double group_max_discharge_rate[W]; // Sum of the discharge rates of the batteries involved in the group load-following.
	double group_rated_power[W]; // Sum of the inverter power ratings of the inverters involved in the group power-factor regulation.
}

class microturbine {
	enumeration {SUPPLY_DRIVEN=5, CONSTANT_PF=4, CONSTANT_PQ=2, CONSTANT_V=1, UNKNOWN=0} generator_mode;
	enumeration {ONLINE=2, OFFLINE=1} generator_status;
	enumeration {DC=1, AC=2} power_type;
	double Rinternal;
	double Rload;
	double V_Max[V];
	complex I_Max[A];
	double frequency[Hz];
	double Max_Frequency[Hz];
	double Min_Frequency[Hz];
	double Fuel_Used[kVA];
	double Heat_Out[kVA];
	double KV;
	double Power_Angle;
	double Max_P[kW];
	double Min_P[kW];
	complex phaseA_V_Out[kV];
	complex phaseB_V_Out[kV];
	complex phaseC_V_Out[kV];
	complex phaseA_I_Out[A];
	complex phaseB_I_Out[A];
	complex phaseC_I_Out[A];
	complex power_A_Out;
	complex power_B_Out;
	complex power_C_Out;
	complex VA_Out;
	double pf_Out;
	complex E_A_Internal;
	complex E_B_Internal;
	complex E_C_Internal;
	double efficiency;
	double Rated_kVA[kVA];
	set {S=112, N=8, C=4, B=2, A=1} phases;
}

class power_electronics {
	enumeration {SUPPLY_DRIVEN=5, CONSTANT_PF=4, CONSTANT_PQ=2, CONSTANT_V=1, UNKNOWN=0} generator_mode;
	enumeration {ONLINE=2, OFFLINE=1} generator_status;
	enumeration {CURRENT_SOURCED=2, VOLTAGE_SOURCED=1} converter_type;
	enumeration {DARLINGTON=7, IBJT=6, JFET=5, SCR=4, MOSFET=3, BJT=2, IDEAL_SWITCH=1} switch_type;
	enumeration {BAND_PASS=4, BAND_STOP=3, HIGH_PASS=2, LOW_PASS=1} filter_type;
	enumeration {PARALLEL_RESONANT=5, SERIES_RESONANT=4, INDUCTIVE=3, CAPACITVE=2, IDEAL_FILTER=1} filter_implementation;
	enumeration {F240HZ=3, F180HZ=2, F120HZ=1} filter_frequency;
	enumeration {DC=1, AC=2} power_type;
	double Rated_kW[kW];
	double Max_P[kW];
	double Min_P[kW];
	double Rated_kVA[kVA];
	double Rated_kV[kV];
	set {S=112, N=8, C=4, B=2, A=1} phases;
}

class rectifier {
	enumeration {TWELVE_PULSE=4, SIX_PULSE=3, THREE_PULSE=2, TWO_PULSE=1, ONE_PULSE=0} rectifier_type;
	enumeration {SUPPLY_DRIVEN=5, CONSTANT_PF=4, CONSTANT_PQ=2, CONSTANT_V=1, UNKNOWN=0} generator_mode;
	complex V_Out[V];
	double V_Rated[V];
	complex I_Out[A];
	complex VA_Out[VA];
	double P_Out;
	double Q_Out;
	complex Vdc[V];
	complex voltage_A[V];
	complex voltage_B[V];
	complex voltage_C[V];
	complex current_A[V];
	complex current_B[V];
	complex current_C[V];
	complex power_A_In[VA];
	complex power_B_In[VA];
	complex power_C_In[VA];
	set {S=112, N=8, C=4, B=2, A=1} phases;
}

class solar {
	enumeration {SUPPLY_DRIVEN=5, CONSTANT_PF=4, CONSTANT_PQ=2, CONSTANT_V=1, UNKNOWN=0} generator_mode;
	enumeration {ONLINE=2, OFFLINE=1} generator_status;
	enumeration {CONCENTRATOR=5, THIN_FILM_GA_AS=4, AMORPHOUS_SILICON=3, MULTI_CRYSTAL_SILICON=2, SINGLE_CRYSTAL_SILICON=1} panel_type;
	enumeration {DC=1, AC=2} power_type;
	enumeration {GROUND_MOUNTED=2, ROOF_MOUNTED=1} INSTALLATION_TYPE;
	enumeration {PLAYERVALUE=2, SOLPOS=1, DEFAULT=0} SOLAR_TILT_MODEL; // solar tilt model used to compute insolation values
	enumeration {FLATPLATE=1, DEFAULT=0} SOLAR_POWER_MODEL;
	double a_coeff; // a coefficient for module temperature correction formula
	double b_coeff[s/m]; // b coefficient for module temperature correction formula
	double dT_coeff[m*m*degC/kW]; // Temperature difference coefficient for module temperature correction formula
	double T_coeff[%/degC]; // Maximum power temperature coefficient for module temperature correction formula
	double NOCT[degF];
	double Tmodule[degF];
	double Tambient[degC];
	double wind_speed[mph];
	double ambient_temperature[degF]; // Current ambient temperature of air
	double Insolation[W/sf];
	double Rinternal[Ohm];
	double Rated_Insolation[W/sf];
	double Pmax_temp_coeff;
	double Voc_temp_coeff;
	complex V_Max[V];
	complex Voc_Max[V];
	complex Voc[V];
	double efficiency[unit];
	double area[sf];
	double soiling[pu]; // Soiling of array factor - representing dirt on array
	double derating[pu]; // Panel derating to account for manufacturing variances
	double Tcell[degC];
	double Rated_kVA[kVA];
	complex P_Out[kW];
	complex V_Out[V];
	complex I_Out[A];
	complex VA_Out[VA];
	object weather;
	double shading_factor[pu]; // Shading factor for scaling solar power to the array
	double tilt_angle[deg]; // Tilt angle of PV array
	double orientation_azimuth[deg]; // Facing direction of the PV array
	bool latitude_angle_fix; // Fix tilt angle to installation latitude value
	enumeration {FIXED_AXIS=1, DEFAULT=0} orientation;
	set {S=112, N=8, C=4, B=2, A=1} phases;
}

class windturb_dg {
	enumeration {ONLINE=2, OFFLINE=1} Gen_status; // Generator is currently available to supply power
	enumeration {SYNCHRONOUS=2, INDUCTION=1} Gen_type; // Standard synchronous generator; is also used to 'fake' a doubly-fed induction generator for now
	enumeration {CONSTANTPQ=3, CONSTANTP=2, CONSTANTE=1} Gen_mode; // Maintains the real and reactive output at the terminals - currently unsupported
	enumeration {BERGEY_10kW=9, GE_25MW=8, VESTAS_V82=7, USER_DEFINED=6, GENERIC_IND_LARGE=5, GENERIC_IND_MID=4, GENERIC_IND_SMALL=3, GENERIC_SYNCH_LARGE=2, GENERIC_SYNCH_MID=1, GENERIC_SYNCH_SMALL=0} Turbine_Model; // Sets all defaults to represent the power output of a Bergey 10kW turbine
	double turbine_height[m]; // Describes the height of the wind turbine hub above the ground
	double roughness_length_factor; // European Wind Atlas unitless correction factor for adjusting wind speed at various heights above ground and terrain types, default=0.055
	double blade_diam[m]; // Diameter of blades
	double blade_diameter[m]; // Diameter of blades
	double cut_in_ws[m/s]; // Minimum wind speed for generator operation
	double cut_out_ws[m/s]; // Maximum wind speed for generator operation
	double ws_rated[m/s]; // Rated wind speed for generator operation
	double ws_maxcp[m/s]; // Wind speed at which generator reaches maximum Cp
	double Cp_max[pu]; // Maximum coefficient of performance
	double Cp_rated[pu]; // Rated coefficient of performance
	double Cp[pu]; // Calculated coefficient of performance
	double Rated_VA[VA]; // Rated generator power output
	double Rated_V[V]; // Rated generator terminal voltage
	double Pconv[W]; // Amount of electrical power converted from mechanical power delivered
	double P_converted[W]; // Amount of electrical power converted from mechanical power delivered
	double GenElecEff[%]; // Calculated generator electrical efficiency
	double generator_efficiency[%]; // Calculated generator electrical efficiency
	double TotalRealPow[W]; // Total real power output
	double total_real_power[W]; // Total real power output
	double TotalReacPow[VA]; // Total reactive power output
	double total_reactive_power[VA]; // Total reactive power output
	complex power_A[VA]; // Total complex power injected on phase A
	complex power_B[VA]; // Total complex power injected on phase B
	complex power_C[VA]; // Total complex power injected on phase C
	double WSadj[m/s]; // Speed of wind at hub height
	double wind_speed_adjusted[m/s]; // Speed of wind at hub height
	double Wind_Speed[m/s]; // Wind speed at 5-15m level (typical measurement height)
	double wind_speed[m/s]; // Wind speed at 5-15m level (typical measurement height)
	double air_density[kg/m^3]; // Estimated air density
	double R_stator[pu*Ohm]; // Induction generator primary stator resistance in p.u.
	double X_stator[pu*Ohm]; // Induction generator primary stator reactance in p.u.
	double R_rotor[pu*Ohm]; // Induction generator primary rotor resistance in p.u.
	double X_rotor[pu*Ohm]; // Induction generator primary rotor reactance in p.u.
	double R_core[pu*Ohm]; // Induction generator primary core resistance in p.u.
	double X_magnetic[pu*Ohm]; // Induction generator primary core reactance in p.u.
	double Max_Vrotor[pu*V]; // Induction generator maximum induced rotor voltage in p.u., e.g. 1.2
	double Min_Vrotor[pu*V]; // Induction generator minimum induced rotor voltage in p.u., e.g. 0.8
	double Rs[pu*Ohm]; // Synchronous generator primary stator resistance in p.u.
	double Xs[pu*Ohm]; // Synchronous generator primary stator reactance in p.u.
	double Rg[pu*Ohm]; // Synchronous generator grounding resistance in p.u.
	double Xg[pu*Ohm]; // Synchronous generator grounding reactance in p.u.
	double Max_Ef[pu*V]; // Synchronous generator maximum induced rotor voltage in p.u., e.g. 0.8
	double Min_Ef[pu*V]; // Synchronous generator minimum induced rotor voltage in p.u., e.g. 0.8
	double pf[pu]; // Desired power factor in CONSTANTP mode (can be modified over time)
	double power_factor[pu]; // Desired power factor in CONSTANTP mode (can be modified over time)
	complex voltage_A[V]; // Terminal voltage on phase A
	complex voltage_B[V]; // Terminal voltage on phase B
	complex voltage_C[V]; // Terminal voltage on phase C
	complex current_A[A]; // Calculated terminal current on phase A
	complex current_B[A]; // Calculated terminal current on phase B
	complex current_C[A]; // Calculated terminal current on phase C
	complex EfA[V]; // Synchronous generator induced voltage on phase A
	complex EfB[V]; // Synchronous generator induced voltage on phase B
	complex EfC[V]; // Synchronous generator induced voltage on phase C
	complex Vrotor_A[V]; // Induction generator induced voltage on phase A in p.u.
	complex Vrotor_B[V]; // Induction generator induced voltage on phase B in p.u.
	complex Vrotor_C[V]; // Induction generator induced voltage on phase C in p.u.
	complex Irotor_A[V]; // Induction generator induced current on phase A in p.u.
	complex Irotor_B[V]; // Induction generator induced current on phase B in p.u.
	complex Irotor_C[V]; // Induction generator induced current on phase C in p.u.
	set {S=112, N=8, C=4, B=2, A=1} phases; // Specifies which phases to connect to - currently not supported and assumes three-phase connection
}

