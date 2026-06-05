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
        this.setLocationRelativeTo(null);
        
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
        //NOT WORKING...
        this.addWindowListener(new WindowAdapter(){
            public void WindowClosing(WindowEvent e){
                tournament.saveToFile("ScoutingData.txt");
            }
        });
        
        //autoload any data that has been previously saved when opening the app
        this.tournament.loadFromFile("ScoutingData.txt");
        
        this.refreshDashboard();
        
        this.add(tabbedApp);
        this.setVisible(true);
    }
    
    private JPanel scoutEntryTab(){
        JPanel scoutEntryTab = new JPanel(new BorderLayout());
        JPanel formPanel = new JPanel(new GridLayout(0,2,10,5));
        
        formPanel.setBorder(BorderFactory.createEmptyBorder(10,010,10,10));
        
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
        
        this.lblEntryStatus = new JLabel(" ");
        
        JButton btnSubmit = new JButton("Submit Scouting Data");
        btnSubmit.addActionListener(e -> this.scoutedBotSubmit());
        
        JPanel bottomPanel = new JPanel(new BorderLayout());
        bottomPanel.setBorder(BorderFactory.createEmptyBorder(5,10,5,10));
        
        bottomPanel.add(btnSubmit, BorderLayout.CENTER);
        bottomPanel.add(this.lblEntryStatus, BorderLayout.SOUTH);
        
        scoutEntryTab.add(new JScrollPane(formPanel), BorderLayout.CENTER);
        scoutEntryTab.add(bottomPanel, BorderLayout.SOUTH);
        
        return scoutEntryTab;
    }
    
    private JPanel dashboardTab(){
        JPanel dashboardTab = new JPanel(new BorderLayout());
        
        String[] strStatColumns = {"Team #", "Avg Auto", "Avg Tele", "Avg End", "Avg Score", "# Matches Played"};
        
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
    
    private JPanel matchPredictorTab(){
        JPanel matchPredictorTab = new JPanel(new BorderLayout());
        
        JPanel selectionPanel = new JPanel(new GridLayout(6,2,10,5));
        selectionPanel.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));
        
        this.redRobot1 = new JComboBox<String>();
        this.redRobot2 = new JComboBox<String>();
        this.redRobot3 = new JComboBox<String>();
        this.blueRobot1 = new JComboBox<String>();
        this.blueRobot2 = new JComboBox<String>();
        this.blueRobot3 = new JComboBox<String>();
        
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
        btnSimulateMatch.addActionListener(e -> this.simulateMatch());
        
        JPanel bottomPanel = new JPanel(new BorderLayout());
        bottomPanel.setBorder(BorderFactory.createEmptyBorder(5,10,5,10));
        bottomPanel.add(btnSimulateMatch, BorderLayout.NORTH);
        bottomPanel.add(new JScrollPane(this.txtMatchResult), BorderLayout.CENTER);
        
        matchPredictorTab.add(selectionPanel, BorderLayout.NORTH);
        matchPredictorTab.add(bottomPanel, BorderLayout.CENTER);
        
        return matchPredictorTab;
    }
    
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
        
        this.picklistModel = new DefaultTableModel(statColumns, 0){
            public boolean isCellEditable(int intRow, int intCol){
                return false;
            }
        };
        
        JTable picklistTable = new JTable(this.picklistModel);
        
        JButton btnGenerate = new JButton("Generate Picklist");
        btnGenerate.addActionListener(e -> this.generatePicklist());
        
        JPanel topPanel = new JPanel(new BorderLayout());
        topPanel.add(weightPanel, BorderLayout.CENTER);
        topPanel.add(btnGenerate, BorderLayout.SOUTH);
        
        picklistTab.add(topPanel, BorderLayout.NORTH);
        picklistTab.add(new JScrollPane(picklistTable), BorderLayout.CENTER);
        
        return picklistTab;
    }
    
    //event handler methods
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
            
            if (robot == null){
                this.tournament.addRobot(shrTeamNumber);
                
                robot = this.tournament.findRobot(shrTeamNumber);
            }
            
            robot.addMatchObservation(shrAutoFuel, shrTeleFuel, shrEndFuel, bytClimbLevel, bytDefenceTime, bytMinorPenalties, bytMajorPenalties, bytDriverDrating, bytAccuracyRating);
            robot.setNotes(strNotes);
            
            this.lblEntryStatus.setText("Team " + shrTeamNumber + " updated. Observations: " + robot.getMatchesObserved());
            
            //reset the form to its defaults
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
    
    private void simulateMatch(){
        try {
            String strRed1 = (String)this.redRobot1.getSelectedItem();
            String strRed2 = (String)this.redRobot2.getSelectedItem();
            String strRed3 = (String)this.redRobot3.getSelectedItem();
            String strBlue1 = (String)this.blueRobot1.getSelectedItem();
            String strBlue2 = (String)this.blueRobot2.getSelectedItem();
            String strBlue3 = (String)this.blueRobot3.getSelectedItem();
            
            if (strRed1 == null || strRed2 == null || strRed3 == null || strBlue1 == null || strBlue2 == null || strBlue3 == null){
                this.txtMatchResult.setText("Error. Please add at least 6 robots before simulating the match.");
                
                return;
            }
            
            ScoutedRobot red1 = this.tournament.findRobot(Short.parseShort(strRed1));
            ScoutedRobot red2 = this.tournament.findRobot(Short.parseShort(strRed2));
            ScoutedRobot red3 = this.tournament.findRobot(Short.parseShort(strRed3));
            ScoutedRobot blue1 = this.tournament.findRobot(Short.parseShort(strBlue1));
            ScoutedRobot blue2 = this.tournament.findRobot(Short.parseShort(strBlue2));
            ScoutedRobot blue3 = this.tournament.findRobot(Short.parseShort(strBlue3));
            
            if (red1 == null || red2 == null || red3 == null || blue1 == null || blue2 == null || blue3 == null){
                this.txtMatchResult.setText("Error. One or more robots do not exist in the current data.");
                
                return;
            }
            
            Alliance redAlliance = new Alliance(red1, red2, red3);
            Alliance blueAlliance = new Alliance(blue1, blue2, blue3);
            
            Match match = new Match(redAlliance, blueAlliance, (byte)0);
            
            this.txtMatchResult.setText(match.getGameSummary());
        } catch (NumberFormatException e){
            this.txtMatchResult.setText("Error. Invalid team number in selection.");
        }
    }
    
    private void generatePicklist(){
        this.tournament.sortByScore();
        
        ArrayList<ScoutedRobot> scoutRobots = this.tournament.getRobots();
        
        byte bytFuelWeight = (byte)this.sldFuelWeight.getValue();
        byte bytClimbWeight = (byte)this.sldClimbWeight.getValue();
        byte bytDefenceWeight = (byte)this.sldDefenceWeight.getValue();
        
        this.picklistModel.setRowCount(0);
        
        for (int i = 0; i < scoutRobots.size(); i++){
            ScoutedRobot robot = scoutRobots.get(i);
            
            short shrFuelScore = (short)(robot.getAutoFuelCount() + robot.getTeleFuelCount() + robot.getEndFuelCount());
            short shrClimbScore = (short)(robot.getClimbLevel() * 10);
            short shrDefenceScore = (short)(robot.getDefenceTime());
            
            //apply slider weights to each score component
            short shrWeightedScore = (short)((shrFuelScore * bytFuelWeight) + (shrClimbScore * bytClimbWeight) + (shrDefenceScore * bytDefenceWeight));
            
            //need to find a way to sort the weighted scores so the ranks match the correct robot
            
            Object[] statRow = {i+1, robot.getTeamNumber(), shrWeightedScore, robot.getMatchesObserved()};
            
            this.picklistModel.addRow(statRow);
        }
        
    }
    
    private void refreshDashboard(){
        //remove all rows to reset the dashboard
        this.dashboardModel.setRowCount(0);
        
        ArrayList<ScoutedRobot> scoutRobots = this.tournament.getRobots();
        
        //loop through the current robot array list
        for (ScoutedRobot robot: scoutRobots){
            //for each robot, get their stats
            
            Object[] statRow = {
                robot.getTeamNumber(),
                robot.getAutoFuelCount(),
                robot.getTeleFuelCount(),
                robot.getEndFuelCount(),
                robot.getIndividualScore(),
                robot.getMatchesObserved()
            };
            
            this.dashboardModel.addRow(statRow);
        }
    }
    
    private void refreshComboBoxes(){
        ArrayList<ScoutedRobot> scoutRobots = this.tournament.getRobots();
        
        this.redRobot1.removeAllItems();
        this.redRobot2.removeAllItems();
        this.redRobot3.removeAllItems();
        this.blueRobot1.removeAllItems();
        this.blueRobot2.removeAllItems();
        this.blueRobot3.removeAllItems();
        
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
        JFileChooser fileChooser = new JFileChooser();
        
        int intResult = fileChooser.showOpenDialog(this);
        
        if (intResult == JFileChooser.APPROVE_OPTION){
            String strFileName = fileChooser.getSelectedFile().getAbsolutePath();
        
            this.tournament.saveToFile(strFileName);
        
            JOptionPane.showMessageDialog(this, "File Saved Successfully!");
        }
    }
    
    private void loadFile(){
        JFileChooser fileChooser = new JFileChooser();
        
        int intResult = fileChooser.showOpenDialog(this);
        
        if (intResult == JFileChooser.APPROVE_OPTION){
            String strFileName = fileChooser.getSelectedFile().getAbsolutePath();
        
            this.tournament.loadFromFile(strFileName);
        
            this.refreshDashboard();
        
            JOptionPane.showMessageDialog(this, "File Loaded Successfully!");
        }
    }
}