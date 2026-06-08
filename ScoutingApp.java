/**
 * Write a description of class ScoutingApp here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */

import javax.swing.*;
import javax.swing.table.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import javax.swing.filechooser.*;

public class ScoutingApp extends JFrame //inhertie from JFrame since it is the app window
{
    //instance variables
    private Tournament tournament;
    
    //gui variables
    
    //scouting tab
    private JTextField txtTeamNumber;
    private JSpinner spnAutoFuel;
    private JSpinner spnTeleFuel;
    private JSpinner spnEndFuel;
    private JSpinner spnClimbLevel;
    private JSpinner spnDefenceime;
    private JSpinner spnMinorPenalties;
    private JSpinner spnMajorPenalties;
    private JSpinner spnDriverRating;
    private JSpinner spnAccuracyRating;
    private JTextField txtNotes;
    private JLabel lblEntryStatus;
    
    //dashboard tab
    private DefaultTableModel dashboardModel;
    
    //match predictor tab
    private JComboBox<String> redRobot1;
    private JComboBox<String> redRobot2;
    private JComboBox<String> redRobot3;
    private JComboBox<String> blueRobot1;
    private JComboBox<String> blueRobot2;
    private JComboBox<String> blueRobot3;
    private JTextArea txtMatchResult;
    
    //picklist tab
    private JSlider sldFuelWeight;
    private JSlider sldClimbWeight;
    private JSlider sldDefenceWeight;
    private DefaultTableModel picklistModel;
    
    //constructor
    public ScoutingApp(){
        this.tournament = new Tournament();
        
        this.setTitle("FRC Scouting App");
        this.setSize(900,600);
        
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.setLocationRelativeTo(null); //place in the center of the screen
        
        JTabbedPane tabbedApp = new JTabbedPane();
        tabbedApp.addTab("Scouting Data Entry Tab", this.scoutEntryTab());
        tabbedApp.addTab("Dashboard Tab", this.dashboardTab());
        tabbedApp.addTab("Match Predictor Tab", this.matchPredictorTab());
        tabbedApp.addTab("Pick List Tab", this.picklistTab());
        
        //automatically refresh the combo boxes when the user goes to the picklist
        //so that the new scouted robots automatically show up
        tabbedApp.addChangeListener(e -> {
            if (tabbedApp.getSelectedIndex() == 2){
                this.refreshComboBoxes();
            }
        });
        
        //options in the file dropdown
        JMenuBar menuBar = new JMenuBar();
        
        JMenu fileMenu = new JMenu("File");
        
        JMenuItem saveItem = new JMenuItem("Save");
        JMenuItem loadItem = new JMenuItem("Load");
        
        //add an action listener so the saveFile and loadFile methods will run when the menu items are clicked
        saveItem.addActionListener(e -> this.saveFile());
        loadItem.addActionListener(e -> this.loadFile());
        
        fileMenu.add(saveItem);
        fileMenu.add(loadItem);
        
        menuBar.add(fileMenu);
        this.setJMenuBar(menuBar);
        
        //autosave the data if the user accidentally closes the window
        this.addWindowListener(new WindowAdapter(){
            public void windowClosing(WindowEvent e){
                ScoutingApp.this.tournament.saveToFile("ScoutingData.txt");
            }
        });
        
        //autoload any data that has been previously saved when opening the app
        this.tournament.loadFromFile("ScoutingData.txt");
        
        this.refreshDashboard();
        
        this.add(tabbedApp);
        this.setVisible(true);
    }
    
    //tab where the scout enters robot data
    private JPanel scoutEntryTab(){
        
        JPanel scoutEntryTab = new JPanel(new BorderLayout());
        JPanel formPanel = new JPanel(new GridLayout(0,2,10,5));
        
        formPanel.setBorder(BorderFactory.createEmptyBorder(10,010,10,10));
        
        //use JSpinner for the incrementing stat values
        this.txtTeamNumber = new JTextField();
        this.spnAutoFuel = new JSpinner(new SpinnerNumberModel(0,0,999,1));
        this.spnTeleFuel = new JSpinner(new SpinnerNumberModel(0,0,999,1));
        this.spnEndFuel = new JSpinner(new SpinnerNumberModel(0,0,999,1));
        this.spnClimbLevel = new JSpinner(new SpinnerNumberModel(0,0,3,1));
        this.spnDefenceime = new JSpinner(new SpinnerNumberModel(0,0,150,1));
        this.spnMinorPenalties = new JSpinner(new SpinnerNumberModel(0,0,20,1));
        this.spnMajorPenalties = new JSpinner(new SpinnerNumberModel(0,0,10,1));
        this.spnDriverRating = new JSpinner(new SpinnerNumberModel(1,1,5,1));
        this.spnAccuracyRating = new JSpinner(new SpinnerNumberModel(1,1,5,1));
        this.txtNotes = new JTextField();
        
        //add each stat to the panel
        formPanel.add(new JLabel("Team Number:"));
        formPanel.add(this.txtTeamNumber);
        formPanel.add(new JLabel("Auto Fuel Count:"));
        formPanel.add(this.spnAutoFuel);
        formPanel.add(new JLabel("Tele Fuel Count:"));
        formPanel.add(this.spnTeleFuel);
        formPanel.add(new JLabel("Endgame Fuel Count:"));
        formPanel.add(this.spnEndFuel);
        formPanel.add(new JLabel("Climb Level (0-3):"));
        formPanel.add(this.spnClimbLevel);
        formPanel.add(new JLabel("Defence Time (in seconds):"));
        formPanel.add(this.spnDefenceime);
        formPanel.add(new JLabel("Minor Penalties"));
        formPanel.add(this.spnMinorPenalties);
        formPanel.add(new JLabel("Major Penalties:"));
        formPanel.add(this.spnMajorPenalties);
        formPanel.add(new JLabel("Driver Rating (1-5):"));
        formPanel.add(this.spnDriverRating);
        formPanel.add(new JLabel("Accuracy Rating (1-5):"));
        formPanel.add(this.spnAccuracyRating);
        formPanel.add(new JLabel("Notes:"));
        formPanel.add(this.txtNotes);
        
        //label status at the bottom of the screen which will either output
        //a successful scout entry or an error
        this.lblEntryStatus = new JLabel(" ");
        
        //button to submit scout data
        //call scoutedBotSubmit when clicked
        JButton btnSubmit = new JButton("Submit Scouting Data");
        btnSubmit.addActionListener(e -> this.scoutedBotSubmit());
        
        //bottomPanel for the submit button and lblEntryStatus
        JPanel bottomPanel = new JPanel(new BorderLayout());
        bottomPanel.setBorder(BorderFactory.createEmptyBorder(5,10,5,10));
        
        bottomPanel.add(btnSubmit, BorderLayout.CENTER);
        bottomPanel.add(this.lblEntryStatus, BorderLayout.SOUTH);
        
        scoutEntryTab.add(new JScrollPane(formPanel), BorderLayout.CENTER);
        scoutEntryTab.add(bottomPanel, BorderLayout.SOUTH);
        
        return scoutEntryTab;
    }
    
    //tab that displays all the scouted robots and their stats in a table
    private JPanel dashboardTab(){
        JPanel dashboardTab = new JPanel(new BorderLayout());
        
        //use an array of strings for the column names
        String[] strStatColumns = {"Team #", "Avg Auto", "Avg Tele", "Avg End", "Avg Score", "# Matches Played"};
        
        //create the table model with the column names and 0 rows
        this.dashboardModel = new DefaultTableModel(strStatColumns, 0){
            public boolean isCellEditable(int intRow, int intCol){
                return false;
            }
        };
        
        JTable dashboardTable = new JTable(this.dashboardModel);
        dashboardTable.setAutoCreateRowSorter(true);
        
        JButton btnRefresh = new JButton("Refresh");
        btnRefresh.addActionListener(e -> this.refreshDashboard());
        
        dashboardTab.add(new JScrollPane(dashboardTable), BorderLayout.CENTER);
        dashboardTab.add(btnRefresh, BorderLayout.SOUTH);
        
        return dashboardTab;
    }
    
    //tab that predicts the outcome of a match based on the selected robots for each alliance
    private JPanel matchPredictorTab(){
        JPanel matchPredictorTab = new JPanel(new BorderLayout());
        
        JPanel selectionPanel = new JPanel(new GridLayout(6,2,10,5));
        selectionPanel.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));
        
        //use combo boxes for the robot selection since there will be
        //a finite number of robots and it will prevent invalid team numbers
        //from being entered
        this.redRobot1 = new JComboBox<String>();
        this.redRobot2 = new JComboBox<String>();
        this.redRobot3 = new JComboBox<String>();
        this.blueRobot1 = new JComboBox<String>();
        this.blueRobot2 = new JComboBox<String>();
        this.blueRobot3 = new JComboBox<String>();
        
        //add the combo boxes to the selection panel with labels
        selectionPanel.add(new JLabel("Red Alliance 1: "));
        selectionPanel.add(this.redRobot1);
        selectionPanel.add(new JLabel("Red Alliance 2: "));
        selectionPanel.add(this.redRobot2);
        selectionPanel.add(new JLabel("Red Alliance 3: "));
        selectionPanel.add(this.redRobot3);
        selectionPanel.add(new JLabel("Blue Alliance 1: "));
        selectionPanel.add(this.blueRobot1);
        selectionPanel.add(new JLabel("Blue Alliance 2: "));
        selectionPanel.add(this.blueRobot2);
        selectionPanel.add(new JLabel("Blue Alliance 3: "));
        selectionPanel.add(this.blueRobot3);
        
        this.txtMatchResult = new JTextArea(5,40);
        this.txtMatchResult.setEditable(false);
        this.txtMatchResult.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 12));
        
        JButton btnSimulateMatch = new JButton("Simulate Match");
        //add an action listener to the button so that when its clicked, the simulateMatch method will run 
        //and output the result in the txtMatchResult text area
        btnSimulateMatch.addActionListener(e -> this.simulateMatch());
        
        JPanel bottomPanel = new JPanel(new BorderLayout());
        bottomPanel.setBorder(BorderFactory.createEmptyBorder(5,10,5,10));
        bottomPanel.add(btnSimulateMatch, BorderLayout.NORTH);
        bottomPanel.add(new JScrollPane(this.txtMatchResult), BorderLayout.CENTER);
        
        matchPredictorTab.add(selectionPanel, BorderLayout.NORTH);
        matchPredictorTab.add(bottomPanel, BorderLayout.CENTER);
        
        return matchPredictorTab;
    }
    
    //tab that generates a picklist of teams based on the scouting data
    //and user defined weights for each stat category
    private JPanel picklistTab(){
        JPanel picklistTab = new JPanel(new BorderLayout());
        
        JPanel weightPanel = new JPanel(new GridLayout(3,2,10,5));
        weightPanel.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));
        
        this.sldFuelWeight = new JSlider(0,10,5);
        this.sldFuelWeight.setMajorTickSpacing(2);
        this.sldFuelWeight.setPaintTicks(true);
        this.sldFuelWeight.setPaintLabels(true);
        
        this.sldClimbWeight = new JSlider(0,10,5);
        this.sldClimbWeight.setMajorTickSpacing(2);
        this.sldClimbWeight.setPaintTicks(true);
        this.sldClimbWeight.setPaintLabels(true);
        
        this.sldDefenceWeight = new JSlider(0,10,5);
        this.sldDefenceWeight.setMajorTickSpacing(2);
        this.sldDefenceWeight.setPaintTicks(true);
        this.sldDefenceWeight.setPaintLabels(true);
        
        weightPanel.add(new JLabel("Fuel Scoring Weight:"));
        weightPanel.add(this.sldFuelWeight);
        weightPanel.add(new JLabel("Climb Points Weight:"));
        weightPanel.add(this.sldClimbWeight);
        weightPanel.add(new JLabel("Defence Effectiveness Weight:"));
        weightPanel.add(this.sldDefenceWeight);
        
        String[] statColumns = {"Rank", "Team #", "Weighted Score", "Matches Scouted"};
        
        //add the stat columns to the table model and make the cells non-editable
        this.picklistModel = new DefaultTableModel(statColumns, 0){
            public boolean isCellEditable(int intRow, int intCol){
                return false;
            }
        };
        
        JTable picklistTable = new JTable(this.picklistModel);
        
        JButton btnGenerate = new JButton("Generate Picklist");
        //add an action listener to the button so that when its clicked
        //the generatePicklist method will run
        btnGenerate.addActionListener(e -> this.generatePicklist());
        
        JPanel topPanel = new JPanel(new BorderLayout());
        topPanel.add(weightPanel, BorderLayout.CENTER);
        topPanel.add(btnGenerate, BorderLayout.SOUTH);
        
        picklistTab.add(topPanel, BorderLayout.NORTH);
        picklistTab.add(new JScrollPane(picklistTable), BorderLayout.CENTER);
        
        return picklistTab;
    }
    
    //event handler methods
    //method that runs when the submit button is clicked in the scouting data entry tab
    private void scoutedBotSubmit(){
        // spnAutoFuel;
        // private JSpinner spnTeleFuel;
        // private JSpinner spnEndFuel;
        // private JSpinner spnClimbLevel;
        // private JSpinner spnDefenceime;
        // private JSpinner spnMinorPenalties;
        // private JSpinner spnMajorPenalties;
        // private JSpinner spnDriverRating;
        // private JSpinner spnAccuracyRating;
        // private JTextField txtNotes
        
        try {
            //need to double cast the values from the spinners
            //since they return Objects and we need to
            //convert them to the correct types for the ScoutedRobot class
            //double casting works by first casting the Object to an Integer (since the spinner values are integers)
            //and then casting the Integer to a short or byte as needed
            short shrTeamNumber = Short.parseShort(this.txtTeamNumber.getText());
            short shrAutoFuel = (short)(int)this.spnAutoFuel.getValue();
            short shrTeleFuel = (short)(int)this.spnTeleFuel.getValue();
            short shrEndFuel = (short)(int)this.spnEndFuel.getValue();
            byte bytClimbLevel = (byte)(int)this.spnClimbLevel.getValue();
            byte bytDefenceTime = (byte)(int)this.spnDefenceime.getValue();
            byte bytMinorPenalties = (byte)(int)this.spnMinorPenalties.getValue();
            byte bytMajorPenalties = (byte)(int)this.spnMajorPenalties.getValue();
            byte bytDriverDrating = (byte)(int)this.spnDriverRating.getValue();
            byte bytAccuracyRating = (byte)(int)this.spnAccuracyRating.getValue();
            String strNotes = this.txtNotes.getText();
            
            //find robot and if its not scouted yet, then create an empty robot object
            ScoutedRobot robot = this.tournament.findRobot(shrTeamNumber);
            
            //if the robot has not been scouted yet
            //then create a new scouted robot with the team number and
            //default values for the stats
            if (robot == null){
                this.tournament.addRobot(shrTeamNumber);
                
                robot = this.tournament.findRobot(shrTeamNumber);
            }
            
            //add the new match observation to the robot
            //and update the average stats of the robot
            robot.addMatchObservation(shrAutoFuel, shrTeleFuel, shrEndFuel, bytClimbLevel, bytDefenceTime, bytMinorPenalties, bytMajorPenalties, bytDriverDrating, bytAccuracyRating);
            robot.setNotes(strNotes);
            
            //update the lblEntryStatus to show a successful entry
            //with the team number and number of observations for that robot
            this.lblEntryStatus.setText("Team " + shrTeamNumber + " updated. Observations: " + robot.getMatchesObserved());
            
            //reset the form to its defaults after submitting
            this.txtTeamNumber.setText("");
            this.txtNotes.setText("");
            this.spnAutoFuel.setValue(0);
            this.spnTeleFuel.setValue(0);
            this.spnEndFuel.setValue(0);
            this.spnClimbLevel.setValue(0);
            this.spnDefenceime.setValue(0);
            this.spnMinorPenalties.setValue(0);
            this.spnMajorPenalties.setValue(0);
            this.spnDriverRating.setValue(1);
            this.spnAccuracyRating.setValue(1);
            
            this.refreshDashboard();
            
        } catch (NumberFormatException e){
            this.lblEntryStatus.setText("Error. Invalid team number.");
        }
    }
    
    //method that simulates a match when the simulate match button is clicked in the match predictor tab
    private void simulateMatch(){
        try {
            //get the selected team numbers from the combo boxes
            //need to cast the selected items to strings since they are returned as Objects
            String strRed1 = (String)this.redRobot1.getSelectedItem();
            String strRed2 = (String)this.redRobot2.getSelectedItem();
            String strRed3 = (String)this.redRobot3.getSelectedItem();
            String strBlue1 = (String)this.blueRobot1.getSelectedItem();
            String strBlue2 = (String)this.blueRobot2.getSelectedItem();
            String strBlue3 = (String)this.blueRobot3.getSelectedItem();
            
            //check if any of the selections are null (in case there are less than 6 robots in the data) and output an error if so
            if (strRed1 == null || strRed2 == null || strRed3 == null || strBlue1 == null || strBlue2 == null || strBlue3 == null){
                this.txtMatchResult.setText("Error. Please add at least 6 robots before simulating the match.");
                
                return;
            }
            
            //find the corresponding scouted robot objects for each selected team number
            //need to parse the strings to shorts since the findRobot method takes a short as an argument
            ScoutedRobot red1 = this.tournament.findRobot(Short.parseShort(strRed1));
            ScoutedRobot red2 = this.tournament.findRobot(Short.parseShort(strRed2));
            ScoutedRobot red3 = this.tournament.findRobot(Short.parseShort(strRed3));
            ScoutedRobot blue1 = this.tournament.findRobot(Short.parseShort(strBlue1));
            ScoutedRobot blue2 = this.tournament.findRobot(Short.parseShort(strBlue2));
            ScoutedRobot blue3 = this.tournament.findRobot(Short.parseShort(strBlue3));
            
            //if any of the selected robots are not found in the data, output an error
            if (red1 == null || red2 == null || red3 == null || blue1 == null || blue2 == null || blue3 == null){
                this.txtMatchResult.setText("Error. One or more robots do not exist in the current data.");
                
                return;
            }
            
            //crete 2 alliances with the selected robots and simulate a match between them
            Alliance redAlliance = new Alliance(red1, red2, red3);
            Alliance blueAlliance = new Alliance(blue1, blue2, blue3);
            
            //create a match object with the 2 alliances and a match number of 0
            Match match = new Match(redAlliance, blueAlliance, (byte)0);
            
            //update the txtMatchResult text area with the summary of the match result
            this.txtMatchResult.setText(match.getGameSummary());
        } catch (NumberFormatException e){
            this.txtMatchResult.setText("Error. Invalid team number in selection.");
        }
    }
    
    //method that generates a picklist based on the weights from the sliders and
    //the scouting data when the generate picklist button is clicked in the picklist tab
    private void generatePicklist(){
        //get the weights from the sliders and sort the robots in the tournament by their weighted score
        //casting is needed since the slider values are returned as ints but the weights in the tournament sorting method are bytes
        byte bytFuelWeight = (byte)this.sldFuelWeight.getValue();
        byte bytClimbWeight = (byte)this.sldClimbWeight.getValue();
        byte bytDefenceWeight = (byte)this.sldDefenceWeight.getValue();
        
        //call the sortByWeightedScore method in the tournament class to sort the robots based on the weights
        this.tournament.sortByWeightedScore(bytFuelWeight, bytClimbWeight, bytDefenceWeight);
        
        //after sorting the robots, get the sorted list of scouted robots and add them to the picklist table with their rank, team number, weighted score, and matches scouted
        ArrayList<ScoutedRobot> scoutRobots = this.tournament.getRobots();
        //reset picklist table before adding the sorted robots
        this.picklistModel.setRowCount(0);
        
        //loop through the sorted list of robots and add them to the picklist table
        //with their rank, team number, weighted score, and matches scouted
        for (int i = 0; i < scoutRobots.size(); i++){
            //get the robot from the sorted list
            ScoutedRobot robot = scoutRobots.get(i);
        
            //calculate the weighted score for each robot based on the weights and the robot's stats
            //casting is needed since the robot stats are shorts and bytes but the weights are bytes, and the final weighted score is a short
            short shrFuelScore = (short)(robot.getAutoFuelCount() + robot.getTeleFuelCount() + robot.getEndFuelCount());
            short shrClimbScore = (short)(robot.getClimbLevel() * 10);
            short shrDefenceScore = (short)(robot.getDefenceTime());
            
            //apply slider weights to each score component
            short shrWeightedScore = (short)((shrFuelScore * bytFuelWeight) + (shrClimbScore * bytClimbWeight) + (shrDefenceScore * bytDefenceWeight));
            
            //need to find a way to sort the weighted scores so the ranks match the correct robot
            
            //use an object array to add the robot stats to the table model
            //has to be an object array since the table model can have different types of data (strings, ints, etc)
            Object[] statRow = {i+1, robot.getTeamNumber(), shrWeightedScore, robot.getMatchesObserved()};
            
            this.picklistModel.addRow(statRow);
        }
        
    }
    
    //method that refreshes the dashboard table with the current list of scouted robots and their stats
    private void refreshDashboard(){
        //remove all rows to reset the dashboard
        this.dashboardModel.setRowCount(0);
        
        ArrayList<ScoutedRobot> scoutRobots = this.tournament.getRobots();
        
        //loop through the current robot array list
        for (ScoutedRobot robot: scoutRobots){
            //for each robot, get their stats
            
            //need to use an object array to add the robot stats to the table model
            Object[] statRow = {
                robot.getTeamNumber(),
                robot.getAutoFuelCount(),
                robot.getTeleFuelCount(),
                robot.getEndFuelCount(),
                robot.getIndividualScore(),
                robot.getMatchesObserved()
            };
            
            //add the robot stats to the dashboard table model as a new row
            this.dashboardModel.addRow(statRow);
        }
    }
    
    //method that refreshes the combo boxes in the match predictor tab with the current list of scouted robots
    private void refreshComboBoxes(){
        //get the current list of scouted robots to populate the combo boxes
        ArrayList<ScoutedRobot> scoutRobots = this.tournament.getRobots();
        
        //first clear all the combo boxes before repopulating them with the updated list of robots
        this.redRobot1.removeAllItems();
        this.redRobot2.removeAllItems();
        this.redRobot3.removeAllItems();
        this.blueRobot1.removeAllItems();
        this.blueRobot2.removeAllItems();
        this.blueRobot3.removeAllItems();
        
        //loop through the list of scouted robots and add their team numbers as options in the combo boxes
        for (ScoutedRobot robot: scoutRobots){
            String strTeamNum = String.valueOf(robot.getTeamNumber());
            
            this.redRobot1.addItem(strTeamNum);
            this.redRobot2.addItem(strTeamNum);
            this.redRobot3.addItem(strTeamNum);
            this.blueRobot1.addItem(strTeamNum);
            this.blueRobot2.addItem(strTeamNum);
            this.blueRobot3.addItem(strTeamNum);
        }
    }

    private void saveFile(){
        //JFIleChooser for file opener
        JFileChooser fileChooser = new JFileChooser();
        
        //only allow users to choose text files
        FileNameExtensionFilter filter = new FileNameExtensionFilter("Text Files", "txt");
        fileChooser.setFileFilter(filter);
        
        //show the file chooser dialog and get the result (approve or cancel)
        int intResult = fileChooser.showOpenDialog(this);
        
        //if the user approves the file selection, get the file name and save the tournament data to that file
        if (intResult == JFileChooser.APPROVE_OPTION){
            //get the absolute path of the selected file as a string
            String strFileName = fileChooser.getSelectedFile().getAbsolutePath();
            
            //call the saveToFile method in the tournament class to save the data to the selected file
            this.tournament.saveToFile(strFileName);
        
            JOptionPane.showMessageDialog(this, "File Saved Successfully!");
        }
    }
    
    private void loadFile(){
        JFileChooser fileChooser = new JFileChooser();
        
        //only allow users to choose text files
        FileNameExtensionFilter filter = new FileNameExtensionFilter("Text Files", "txt");
        fileChooser.setFileFilter(filter);
        
        //show the file chooser dialog and get the result (approve or cancel)
        int intResult = fileChooser.showOpenDialog(this);
        
        //if the user approves the file selection, get the file name and load the tournament data from that file, then refresh the dashboard to show the loaded data
        if (intResult == JFileChooser.APPROVE_OPTION){
            String strFileName = fileChooser.getSelectedFile().getAbsolutePath();
        
            this.tournament.loadFromFile(strFileName);
        
            this.refreshDashboard();
        
            JOptionPane.showMessageDialog(this, "File Loaded Successfully!");
        }
    }
}