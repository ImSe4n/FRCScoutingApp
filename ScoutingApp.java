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
    private JSpinner spnclimbLevel;
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
        
        saveItem.addActionListener(e -> this.saveFile());
        loadItem.addActionListener(e -> this.loadFile());
        
        fileMenu.add(saveItem);
        fileMenu.add(loadItem);
        
        menuBar.add(fileMenu);
        this.setJMenuBar(menuBar);
        
        //autosave the data if the user accidentally closes the window
        this.addWindowListener(new WindowAdapter(){
            public void WindowClosing(WindowEvent e){
                ScoutingApp.this.tournament.saveToFile("ScoutingData.txt");
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
        this.spnclimbLevel = new JSpinner(new SpinnerNumberModel(0,0,3,1));
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
        formPanel.add(this.spnclimbLevel);
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
        
    }
    
    private void simulateMatch(){
        
    }
    
    private void generatePicklist(){
        
    }
    
    private void refreshDashboard(){
        
    }
    
    private void refreshComboBoxes(){
        
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